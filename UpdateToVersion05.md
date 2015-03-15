When updating from version 0.4 to 0.5, the following aspects have changed and may have to be adjusted.

Main Changes:
  * Persistence has changed (no longer fires events)
  * Support for persistence with lazy trees
  * Added a sample web server for lazy trees (written in Python)
  * Using jQuery 1.3.2 and jQuery UI 1.7.1

New functions:
  * Callback function onPostInit(isReloading, isError)
  * tree.reactivate(setFocus)ui.core 1.7.1
  * tree.isInitializing()
  * tree.isReloading()
  * tree.isUserEvent()
  * tree.getPersistData()
  * Global: getDynaTreePersistData(cookieId, cookieOpts)
  * dtnode.getEventTargetType(event)

New options for initAjax:
  * addActiveKey
  * addFocusedKey
  * addExpandedKeyList

Other Changes:
  * The default cookie name prefix was changed from 'ui-dynatree-cookie-' to 'dynatree-'.
  * The A tag containing the title now has a class name assigned ('ui-dynatree-title')
  * `_`nodeCount starts with 1, so first auto - key is '_1'
  * tree.initMode was dropped (now tree.phase)_


### Persistence has changed ###

When initializing a tree in persist mode, we first check, if existing persistence cookies are found.<br>
In this case we assume <b>re</b>-loading, ignore the source node attributes and override them using the cookie info.<br>
<br>
Otherwise we assume first-time initilaizing, read the status from the tree source, and store it into new cookies.<br>
<br>
After loading, the 'active' status of a node is restored.<br>
But <b>we no longer fire onActivate events</b>.<br>
(The only event that may be fired is <code>onFocus</code>.)<br>
<br>
In order to generate these events on reload, use the new callback function <code>onPostInit()</code> and <code>tree.reactivate()</code>.<br>
<br>
Example<br>
<pre><code>    onPostInit: function(isReloading, isError) {<br>
        // 'this' is the current tree<br>
        // isReloading is set, if status was read from existing cookies<br>
        // isError is only used in Ajax mode<br>
        // Fire an onActivate() event for the currently active node<br>
        this.reactivate();<br>
    },<br>
    onActivate: function(dtnode) {<br>
        // Use status functions to find out about the calling context<br>
        var isInitializing = dtnode.tree.isInitializing(); // Tree loading phase<br>
        var isReloading = dtnode.tree.isReloading(); // Loading phase, and reading status from cookies<br>
        var isUserEvent = dtnode.tree.isUserEvent(); // Event was triggered by mouse or keyboard<br>
        <br>
        $("#echoActive").text(dtnode.data.title);<br>
    },<br>
</code></pre>


<h3>Support for persistence with lazy trees</h3>

The problem with restoring the status of a <i>lazy</i> tree is, that the currently active<br>
or selected nodes may not be part of the tree, when it is freshly re-loaded.<br>
<br>
The basic idea is to leave it up to the backend webservice to deliver not only the<br>
top-level nodes, but also all nodes that are required to display the current status.<br>
<br>
For example, it may be neccessary to render 3 parent nodes, if the active node is at level # 4.<br>
The backend may also deliver all child nodes of expanded parents.<br>
Or in selectMode 3 (hierarchical) we may want to send all nodes, that are partly selected.<br>
<br>
initAjax (and appendAjax) have 3 new options, that allow to pass the persistence<br>
information to the web service handler.<br>
<br>
<pre><code>[...]<br>
    initAjax: {url: "/ajaxTree",<br>
               data: {key: key,<br>
                      mode: mode,<br>
                      filter: filter<br>
                      },<br>
               addActiveKey: true,  // add &amp;activeKey= parameter to URL<br>
               addFocusedKey: true, // add &amp;focusedKey= parameter to URL<br>
               addExpandedKeyList: true // add &amp;expandedKeyList= parameter to URL<br>
               },<br>
    onPostInit: function(isReloading, isError) {<br>
        // In lazy mode, this will be called *after* the initAjax request returned.<br>
        // 'this' is the current tree<br>
        // isReloading is set, if status was read from existing cookies<br>
        // isError is set, if Ajax failed<br>
        // Fire an onActivate() event for the currently active node<br>
        this.reactivate();<br>
    },<br>
    onActivate: function(dtnode) {<br>
        // Use status functions to find out about the calling context<br>
        var isUserEvent = dtnode.tree.isUserEvent(); // Event was triggered by mouse or keyboard<br>
        <br>
        $("#echoActive").text(dtnode.data.title);<br>
    },<br>
           [...]<br>
</code></pre>