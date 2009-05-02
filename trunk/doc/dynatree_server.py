"""
    This sample web server demonstrates how to implement a web service for 
    Dynatree requests.
    
    As data source, we choose a folder in the local file system, simply
    because it is hierarchical and has a concept of documents (files) and
    folders (directories) and because it was easy to implement.
    A typical web service would of course read the data from a 'real' source 
    like an SQL database or XML file, but I hope you get the idea ;-)
    
    See: http://dynatree.googlecode.com
    
    Martin Wendt, 2009
    
    Usage:    
      1. Python 2.5 or later is required to run this server.
         For Python 2.5 the simplejson module must also be installed;
         Python 2.6 has built in json support.
      2. Configure the rootPath variable in the main() function at the bottom
         of this module.
      3. Run this module:
         >python dynatree_server.py

    This module
      - Is a standalone web server that answers URLs beginning with
            http://127.0.0.1:8001/?...
        with JSON responses that conform to the Dynatree spec.
        However, we don't do error checking or anything else that would be 
        required for production environments.
        
      - Answers requests to initialize a tree using the 'initAjax: {}' option:
            http://127.0.0.1:8001/?mode=baseFolders
        with a list of files/directories in the configured root directory.
        
      - Answers requests to lazy-load node children using 'appendAjax({...})':
            http://127.0.0.1:8001/?key=_25c2b6d6
        with a list of files/directories in the directory that matches this key.
        
      - Supports Dynatree's 'lazy persistence':
            http://127.0.0.1:8001/?mode=baseFolder&expandedKeyList=_41771df2%2C_4230fb68%2C...
        will return not only the base entries, but also all children inside 
        parents that are listed as expanded.       
        
      - Supports &sleep=SECONDS argument for simulating slow responses.

      - Supports the JSONP protocol:
            http://127.0.0.1:8001/?mode=baseFolder&callback=jsonp1241293219729
        will wrap the result like this "jsonp1241293219729(<res>)".
        This is only required, if this web service is not on the same host as 
        the web page that contains the Dynatree widget.
        JSONP can be enabled for jQuery.ajax() by passing dataType: 'jsonp'
        instead of 'json'. 
        

Sample Dynatree options to use this service:
        $("#tree").dynatree({
            ...
            persist: true,
            initAjax: {url: "http://127.0.0.1:8001",
                       dataType: "jsonp", // Enable JSONP, so this sample can be run from the local file system against a localhost server
                       data: {key: "",
//                              sleep: 3,
                              mode: "baseFolders"
                              },
                       addExpandedKeyList: true // Send list of expanded keys, so the webservice can deliver these children also
                       },
            onLazyRead: function(dtnode){
                dtnode.appendAjax(
                    {url: "http://127.0.0.1:8001", 
                     dataType: "jsonp",
                     data: {key: dtnode.data.key,
                            mode: "branch"
                            }
                });
            }
        });
"""

import cgi, os, time

try:
    import json # Available since Python 2.6
except ImportError:
    import simplejson as json

#===============================================================================
# Helper functions
#===============================================================================

def _keyFromString(s):
    """Calculate a unique key for an arbitrary  string.
    
    Example: _keyFromString("c:\temp\wsgidav1\src\DAV") = "_25c2b6d6"
    """
    return "_" + hex(hash(s)) [3:]


def _findFolderByKey(rootPath, key):
    """Search rootPath and all sub folders for a directory that matches the key."""
    for root, dirs, files in os.walk(rootPath):
        for name in dirs:
            fullPath = os.path.join(root, name)
            fileKey = _keyFromString(fullPath) 
            if key == fileKey:
                return fullPath
    return None

    
#===============================================================================
# DynaTreeWsgiApp
#===============================================================================

class DynaTreeWsgiApp(object):
    """This WSGI application serves a file system for dynatree."""
    def __init__(self, optionDict):
        self.optionDict = optionDict

    def __call__(self, environ, start_response):
        """Handle one HTTP request."""
        
        # Parse URL query into a list of 2-tuples (name, value) 
        argList = cgi.parse_qsl(environ.get("QUERY_STRING", ""))
        # Convert to dictionary {"name": "value", ... }
        argDict = dict(argList)
        print "Query args: %s" % argDict

        # Support &sleep=SECONDS argument for debugging
        if argDict.get("sleep"):
            print "Sleeping %s seconds..." % argDict.get("sleep")
            time.sleep(int(argDict.get("sleep")))

        # Eval 'mode' and 'key' arguments
        rootPath = self.optionDict["rootPath"]
        if argDict.get("mode") == "baseFolders":
            folderPath = rootPath
        elif argDict.get("key"):
            key = argDict.get("key")
            folderPath = _findFolderByKey(rootPath, key)
            if not folderPath:
                raise RuntimeError("Could not find folder for key '%s'." % key)
        else:
            raise RuntimeError("Missing required argument '&mode=baseFolder' or '&key=...'")

        # Get list of child nodes (may be recursive)
        childList = [ ]
        self.makeChildList(argDict, folderPath, childList)
        
        # Convert result list to a JSON string
        res = json.dumps(childList, encoding="Latin-1")
        
        # Support for the JSONP protocol.
        if "callback" in argDict:
            res = argDict["callback"] + "(" + res + ")" 

        # Return HTTP response 
        start_response("200 OK", [("Content-Type", "application/json")])
        return [ res ]


    def makeChildList(self, argDict, folderPath, childList):
        print "makeChildList ", folderPath
        expandedKeyList = argDict.get("expandedKeyList", "").split(",")
        filenameList = os.listdir(folderPath)
        for fn in filenameList:
            fullPath = os.path.join(folderPath, fn)
            isFolder = os.path.isdir(fullPath)
            key = _keyFromString(fullPath)
            size = os.path.getsize(fullPath)
            date = time.ctime(os.path.getmtime(fullPath))
            # Create a node dictionary and append it to the child list
            node = {"title": fn,
                    "key": key,
                    "isFolder": isFolder,
                    "isLazy": isFolder,
                    "tooltip": "%s, %s bytes, modified: %s" % (fullPath, size, date),
                    }
            childList.append(node)
            # Support lazy persistence:
            # If the current node was requested as 'expanded', load the children too 
            if isFolder and key in expandedKeyList:
                subNodes = []
                self.makeChildList(argDict, fullPath, subNodes)
                node["children"] = subNodes
                node["expand"] = True
    

#===============================================================================
# Server
#===============================================================================

# Requires Python >= 2.5
from wsgiref.simple_server import WSGIServer, WSGIRequestHandler 

def make_server(host, port, app, server_class=WSGIServer, handler_class=WSGIRequestHandler):
    """Create a new WSGI server listening on 'host' and 'port' for 'app'."""
    server = server_class((host, port), handler_class)
    server.set_app(app)
    return server


def main():  
    rootPath = r"c:\temp"
    hostname = "127.0.0.1" # Use empty string for localhost
    port = 8001

    wsgi_app = DynaTreeWsgiApp({"rootPath": rootPath})

    httpd = make_server(hostname, port, wsgi_app)
    
    sa = httpd.socket.getsockname()

    print "Exporting file system at ", rootPath, " for Dynatree."
    print "Serving HTTP on", sa[0], "port", sa[1], "..."

    httpd.serve_forever()
     

if __name__ == "__main__":
    main()
