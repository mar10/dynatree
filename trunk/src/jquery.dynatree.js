/*************************************************************************
	jquery.dynatree.js
	Dynamic tree view control, with support for lazy loading of branches.

	Copyright (c) 2008-2009  Martin Wendt (http://wwWendt.de)
	Licensed under the MIT License (MIT-License.txt)

	A current version and some documentation is available at
		http://dynatree.googlecode.com/

	Let me know, if you find bugs or improvements (martin at domain wwWendt.de).

	$Version:$
	$Revision:$

 	@depends: jquery.js
 	@depends: ui.core.js
    @depends: jquery.cookie.js
*************************************************************************/

/* 
 * TODO
 *   - BUG: focus not persisted in Chrome
 *   - BUG: disable() hängt sich auf (replace with simple 'return false' in callbacks?)
 *          unbind: auch focus handler entfernen
 *          tree.isDisabled verwenden?
 *   - BUG: context menu is not keyboard aware on IE, Safari, Chrome
 *          (Seems to be a bug in the plugin: http://abeautifulsite.net/notebook_files/80/demo/jqueryContextMenu.html)
 *      
 *   - lazy mode, ajaxInit: 
 *        focus ok?
 *        postinit events ok?
 *        select, .. flags ok?
 *   - BUG: open lazy node, [F5] --> Node is marked open, but not expanded
 *   - onPostInit: setzt auch die Cookies (muss auch be lazyInit delayed aufgerufen werden
 *   
 *   - implement  minExpandLevel > 1 
 *   - options.hideCheckbox, class="hideCheckbox"
 *
 *   - use opts.debugLevel instead of _bDebug
 *   - $(this.span) --> $span
 *   - issue #56: <span class="ui-dynatree-title"> --> use a template?
 *   - data.isFolder -> folder, .isLazy -> lazy 
 *   - ltWait.gif and ltError.gif -> options
 *
 *	 - Root immer verstecken. 
 *     (Man kann ja einen einzelnen node erstellen, um das zu erreichen)
 *     Die Top-level Nodes expander sind nicht durch vlines verbunden.
 *     --> Es wird ein neues Icon benötigt. 
 *     Wenn minExpandLevel>=1, werden Die TL Expander nicht dargestellt, so dass
 *     die gesammte Spalte verschwindet
 *     
 *   - Render überarbeiten (sollte nicht mehr als einmal nötig sein)
 *     Ggf. muss noch remove, insert berücksichtigt werden
 *     
 *   Test and doc
 *     - Test files for release: use minified libs 
 *     - rework samples with better names and title, header explanation
 *     - sample-options: mit reInit() und interaktiven options
 *     
 *   New options
 *     - option node.unselectable, to hide checkbox
 *     
 *   - $("#ui-dynatree-id-5").attr("dtnode").focus();
 *
 * =============================================================================
 * 
 *	Später:
 *	  - Drag'n'drop support vorbereiten:
 * 	    Das jquery plugin muss sich leicht integreren lassen
 * 	    - node.insertBefore
 * 	      node.insertAfter
 *   - Table-Tree: use CSS 2.1: display:table, display:table-row, display:table-cell 
 *  - Tree <div> should behave like a control:
 *    when we Tab into the tree, the last focused node should be focused
 * 
 * =============================================================================
 * 
 * Changelog 0.3 -> 0.4
 *   - New ui.core.js 1.5.2 -> 1.6 rc2
 *   - issue #59: 'expand' -> 'expanded'
 *     data.select and expand are commands(verbs) class="expanded selected" are adjectives  
 *   - issue #54: class='selected expanded lazy folder'
 *     Note: Cookie persistence overrides 'expanded' 
 *     Note: data='...' overrides id, class, and title attributes
 *     Note: id="" must begin with a character.  
 *   - issue #53: 'selected'
 *   - issue # : tree.visit
 *   - tree.bind / unbind
 *   - tree.enable / disable
 *   - opts.onClick, ... to hook events
 *   - issue #63: work with prototype
 *   - distinguish 'active' and 'selected' 
 *   - issue #15: multi-select
 *   - issue #17: checkbox mode
 *   - use span + css backround-image: url()
 *   - issue # : use effects for expanding 
 *   - image paths configurable using css
 *   - issue #61: allow image names + extensions
 *   - onKeypress event wird in FF für [space] doppelt aufgerufen, weil erst keydown kommt
 *     http://www.quirksmode.org/js/keys.html
 *     --> alles auf keydown umstellen (?), denn das kommt immer
 *     Ausserdem charcode vermeiden und stattdessen keycode verwenden.
 *   - unselect removed
 *   - focusRoot
 *     use 'focus' style for initial focus
 *     use autoFocus for runtime behaviour
 *   - onDblClick(): lieber nicht den folder togglen; das sollte besser ein custom callback machen 
 *     (toggle() sollte dann aber sicherstellen, dass mandatory rootnodes nicht kollabieren).
 *   - selectionVisible --> activeVisible
 *   - expandOnAdd --> removed
 *   - rootCollapsible --> minExpandLevel
 *
 */

/*************************************************************************
 *	Debug functions
 */
var _bDebug = false;
_bDebug = true;

function logMsg(msg) {
	// Usage: logMsg("%o was toggled", this);
	// See http://michaelsync.net/2007/09/09/firebug-tutorial-logging-profiling-and-commandline-part-i
	// for details (logInfo, logWarning, logGroup, ...)
	if ( _bDebug  && window.console && window.console.log ) {
		var dt = new Date();
		var tag = dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()+"."+dt.getMilliseconds();
		arguments[0] = tag + " - " + arguments[0];
		try {
			// Safari gets here, but fails
			window.console.log.apply(this, arguments);
		} catch(e) {
		}
	}
}

/*************************************************************************
 *	
 */
var DTNodeStatus_Error   = -1;
var DTNodeStatus_Loading = 1;
var DTNodeStatus_Ok      = 0;



;(function($) {

/*************************************************************************
 *	Common functions for extending classes etc.
 *	Borrowed from prototype.js
 */

var Class = {
	create: function() {
		return function() {
			this.initialize.apply(this, arguments);
		}
	}
}
/*
Array.prototype.remove = function(from, to) {
	// Array Remove - By John Resig (MIT Licensed)
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
*/

/*************************************************************************
 *	DynaTreeNode
 */
var DynaTreeNode = Class.create();

DynaTreeNode.prototype = {
	initialize: function(tree, data) {
		this.tree = tree;
		if ( typeof data == "string" ) 
			data = { title: data };
		if( data.key == undefined )
			data.key = "_" + tree._nodeCount++;
		this.data = $.extend({}, $.ui.dynatree.nodedatadefaults, data);
		this.parent = null; // not yet added to a parent
		this.div = null; // not yet created
		this.span = null; // not yet created
		this.childList = null; // no subnodes yet
		this.isRead = false; // Lazy content not yet read
		this.hasSubSel = false;
		

		if( tree.initMode == "cookie" ) {
			// Init status from cookies
			if( this.tree.initActiveKey == this.data.key )
				this.tree.activeNode = this;
			if( this.tree.initFocusKey == this.data.key )
				this.tree.focusNode = this;
			this.isExpanded = ($.inArray(this.data.key, this.tree.initExpandedKeys) >= 0);
			this.isSelected = ($.inArray(this.data.key, this.tree.initSelectedKeys) >= 0);
//			logMsg("this.data.key=%o, this.tree.initSelectedKeys=%o --> %o", this.data.key, this.tree.initSelectedKeys, this.isSelected);
		} else {
			// Init status from data (write to cookie after init phase)
			if( data.activate )
				this.tree.activeNode = this;
			if( data.focus )
				this.tree.focusNode = this;
			this.isExpanded = ( data.expand == true );// Collapsed by default
			this.isSelected = ( data.select == true ); // Deselected by default
		}
		if( this.isExpanded )
			this.tree.expandedNodes.push(this);
		if( this.isSelected )
			this.tree.selectedNodes.push(this);
	},

	toString: function() {
		return "dtnode<" + this.data.key + ">: '" + this.data.title + "'";
	},

	_getInnerHtml: function() {
		var res = "";

		// parent connectors
		var bIsRoot = (this.parent==null);
//		var bHideFirstConnector = (!this.tree.options.rootVisible || !this.tree.options.rootCollapsible );
		var bHideFirstConnector = (!this.tree.options.rootVisible || this.tree.options.minExpandLevel>0 );

		var p = this.parent;
		var cache = this.tree.cache;
		while ( p ) {
			if ( ! (bHideFirstConnector && p.parent==null ) )
				res = ( p.isLastSibling() ? cache.tagEmpty : cache.tagVline) + res ;
			p = p.parent;
		}

		// connector (expanded, expandable or simple)
		if ( bHideFirstConnector && bIsRoot  ) {
			// skip connector
		} else if ( this.childList || this.data.isLazy) {
   			res += cache.tagExpander;
		} else {
   			res += cache.tagConnector;
		}
		
		// Checkbox mode
		if( this.tree.options.checkbox && this.data.hideCheckbox!=true && !this.data.isStatusNode) {
   			res += cache.tagCheckbox;
		}
		
		// folder or doctype icon
   		if ( this.data.icon ) {
    		res += "<img src='" + this.tree.options.imagePath + this.data.icon + "' alt='' />";
   		} else if ( this.data.icon == false ) {
        	// icon == false means 'no icon'
		} else {
        	// icon == null means 'default icon'
   			res += cache.tagNodeIcon;
		}

		// node name
		var tooltip = ( this.data && typeof this.data.tooltip == "string" ) ? " title='" + this.data.tooltip + "'" : "";
		res +=  "<a href='#'" + tooltip + ">" + this.data.title + "</a>";
		return res;
	},

	render: function(bDeep, bHidden) {
		// 
//		logMsg("%o.render()", this);
		// --- create <div><span>..</span></div> tags for this node
		if( ! this.div ) {
			this.span = document.createElement("span");
			this.span.dtnode = this;
			if( this.data.key )
				this.span.id = this.tree.options.idPrefix + this.data.key;

			this.div  = document.createElement("div");
			this.div.appendChild(this.span);
			if ( this.parent )
				this.parent.div.appendChild(this.div);

			if( this.parent==null && !this.tree.options.rootVisible )
				this.span.style.display = "none";
		}
		// set node connector images, links and text
		this.span.innerHTML = this._getInnerHtml();

		// hide this node, if parent is collapsed
		this.div.style.display = ( this.parent==null || this.parent.isExpanded ? "" : "none");

		// Set classes for current status
		this.span.className = ( this.data.isFolder ) ? this.tree.options.classNames.folder : this.tree.options.classNames.document;
		if( this.isExpanded )
			$(this.span).addClass(this.tree.options.classNames.expanded);
		if( this.data.isLazy && !this.isRead )
			$(this.span).addClass(this.tree.options.classNames.lazy);
		if( this.isLastSibling() )
			$(this.span).addClass(this.tree.options.classNames.lastsib);
		if( this.isSelected )
			$(this.span).addClass(this.tree.options.classNames.selected);
		if( this.hasSubSel )
			$(this.span).addClass(this.tree.options.classNames.partsel);
		if( this.tree.activeNode === this )
			$(this.span).addClass(this.tree.options.classNames.active);

		if( bDeep && this.childList && (bHidden || this.isExpanded) ) {
			for(var i=0; i<this.childList.length; i++) {
				this.childList[i].render(bDeep, bHidden)
			}
		}
	},

	hasChildren: function() {
		return this.childList != null;
	},

	isLastSibling: function() {
		var p = this.parent;
		if ( !p ) return true;
		return p.childList[p.childList.length-1] === this;
	},

	prevSibling: function() {
		if( !this.parent ) return null;
		var ac = this.parent.childList;
		for(var i=1; i<ac.length; i++) // start with 1, so prev(first) = null
			if( ac[i] === this )
				return ac[i-1];
		return null;
	},

	nextSibling: function() {
		if( !this.parent ) return null;
		var ac = this.parent.childList;
		for(var i=0; i<ac.length-1; i++) // up to length-2, so next(last) = null
			if( ac[i] === this )
				return ac[i+1];
		return null;
	},

	_setStatusNode: function(data) {
		// Create, modify or remove the status child node (pass 'null', to remove it).
		var firstChild = ( this.childList ? this.childList[0] : null );
		if( !data ) {
			if ( firstChild ) {
				this.div.removeChild(firstChild.div);
				if( this.childList.length == 1 )
					this.childList = null;
				else
					this.childList.shift();
			}
		} else if ( firstChild ) {
			data.isStatusNode = true;
			firstChild.data = data;
			firstChild.render(false, false);
		} else {
			data.isStatusNode = true;
			firstChild = this._addChildNode (new DynaTreeNode (this.tree, data));
//			firstChild.data.isStatusNode = true;
		}
	},

	setLazyNodeStatus: function(lts) {
		switch( lts ) {
			case DTNodeStatus_Ok:
				this._setStatusNode(null);
				this.isRead = true;
				this.render(false, false);
				if( this.tree.options.autoFocus ) {
					if( this === this.tree.tnRoot && !this.tree.options.rootVisible && this.childList ) {
						// special case: using ajaxInit
						this.childList[0].focus();
					} else {
						this.focus();
					}
				}
				break;
			case DTNodeStatus_Loading:
				this._setStatusNode({
					title: this.tree.options.strings.loading,
					icon: "ltWait.gif"
				});
				break;
			case DTNodeStatus_Error:
				this._setStatusNode({
					title: this.tree.options.strings.loadError,
					icon: "ltError.gif"
				});
				break;
			default:
				throw "Bad LazyNodeStatus: '" + lts + "'.";
		}
	},

	_parentList: function(includeRoot, includeSelf) {
		var l = new Array();
		var dtn = includeSelf ? this : this.parent;
		while( dtn ) {
			if( includeRoot || dtn.parent )
				l.unshift(dtn);
			dtn = dtn.parent;
		};
		return l;
	},

	isVisible: function() {
		// Return true, if all parents are expanded.
		var parents = this._parentList(true, false);
		for(var i=0; i<parents.length; i++)
			if( ! parents[i].isExpanded ) return false;
		return true;
	},

	makeVisible: function() {
		// Make sure, all parents are expanded
		var parents = this._parentList(true, false);
		for(var i=0; i<parents.length; i++)
			parents[i]._expand(true);
	},

	focus: function() {
		// TODO: check, if we already have focu
		logMsg("dtnode.focus(): %o", this);
		this.makeVisible();
		try {
			$(this.span).find(">a").focus();
		} catch(e) { }
	},

	isActive: function() {
		return (this.tree.activeNode === this);
	},
	
	activate: function() {
		// Select - but not focus - this node.
		logMsg("dtnode.activate(): %o", this);
		var opts = this.tree.options;
		if( this.tree.isDisabled || this.data.isStatusNode )
			return;
		if( this.tree.activeNode ) {
			if( this.tree.activeNode === this )
				return;
			this.tree.activeNode.deactivate();
		}
		if( opts.activeVisible )
			this.makeVisible();
		this.tree.activeNode = this;
        if( opts.persist )
			$.cookie(opts.cookieId+"-active", this.data.key);
		$(this.span).addClass(opts.classNames.active);
		if ( opts.onActivate ) // Pass element as 'this' (jQuery convention)
			opts.onActivate.call(this.span, this);
	},

	deactivate: function() {
		logMsg("dtnode.deactivate(): %o", this);
		if( this.tree.activeNode === this ) {
			var opts = this.tree.options;
			$(this.span).removeClass(opts.classNames.active);
	        if( opts.persist )
				$.cookie(opts.cookieId+"-active", "");
			this.tree.activeNode = null;
			if ( opts.onDeactivate )
				opts.onDeactivate.call(this.span, this);
		}
	},

	_userActivate: function() {
		// Handle user click / [space] / [enter], according to clickFolderMode.
		var activate = true;
		var expand = false;
		if ( this.data.isFolder ) {
			switch( this.tree.options.clickFolderMode ) {
			case 2:
				activate = false;
				expand = true;
				break;
			case 3:
				activate = expand = true;
				break;
			}
		}
		if( this.parent == null && this.tree.options.minExpandLevel>0 ) {
			expand = false;
		}
		if( expand ) {
			this.toggleExpand();
			this.focus();
		} 
		if( activate ) {
			this.activate();
		}
	},

	_setSubSel: function(hasSubSel) {
		if( hasSubSel ) {
			this.hasSubSel = true;
			$(this.span).addClass(this.tree.options.classNames.partsel);
		} else {
			this.hasSubSel = false;
			$(this.span).removeClass(this.tree.options.classNames.partsel);
		}
	},
	
	_select: function(sel, fireEvents, deep) {
		// Select - but not focus - this node.
		logMsg("dtnode._select(%o) - %o", sel, this);
		var opts = this.tree.options;
		if( this.tree.isDisabled || this.data.isStatusNode )
			return;
		// 
		if( this.isSelected == sel ) {
			logMsg("dtnode._select(%o) IGNORED - %o", sel, this);
			return;
		}
		// Allow event listener to abort selection
		if ( fireEvents && opts.onQuerySelect && opts.onQuerySelect.call(this.span, sel, this) == false )
			return; // Callback returned false
		
		// Force sinlge-selection
		if( opts.selectMode==1 && this.tree.selectedNodes.length && sel ) 
			this.tree.selectedNodes[0]._select(false, false, false);

		this.isSelected = sel;
        this.tree._changeNodeList("select", this, sel);
			
		if( sel ) {
			$(this.span).addClass(opts.classNames.selected);

			if( deep && opts.selectMode==3 ) {
				// Select all children
				this.visit(function(dtnode){
					dtnode.parent._setSubSel(true);
					dtnode._select(true, false, false);
				});
				// Select parents, if all children are selected
				var p = this.parent;
				while( p ) {
					p._setSubSel(true);
					var allChildsSelected = true;
					for(var i=0; i<p.childList.length;  i++) {
						if( !p.childList[i].isSelected ) {
							allChildsSelected = false;
							break;
						}
					}
					if( allChildsSelected )
						p._select(true, false, false);
					p = p.parent;
				}
			}

			if ( fireEvents && opts.onSelect )
				opts.onSelect.call(this.span, true, this);

		} else {
			$(this.span).removeClass(opts.classNames.selected);

	    	if( deep && opts.selectMode==3 ) {
				// Deselect all children
				this._setSubSel(false);
				this.visit(function(dtnode){
					dtnode._setSubSel(false);
					dtnode._select(false, false, false);
				});
				// Deselect parents, and recalc hasSubSel
				var p = this.parent;
				while( p ) {
					p._select(false, false, false);
					var isPartSel = false;
					for(var i=0; i<p.childList.length;  i++) {
						if( p.childList[i].isSelected || p.childList[i].hasSubSel ) {
							isPartSel = true;
							break;
						}
					}
					p._setSubSel(isPartSel);
					p = p.parent;
				}
			}
			if ( fireEvents && opts.onSelect )
				opts.onSelect.call(this.span, false, this);
		}
	},

	select: function(sel) {
		// Select - but not focus - this node.
		logMsg("dtnode.select(%o) - %o", sel, this);
		return this._select(sel!=false, true, true);
	},

	toggleSelect: function() {
		logMsg("dtnode.toggleSelect() - %o", this);
		return this.select(!this.isSelected);
	},

	_expand: function(bExpand) {
//		logMsg("dtnode._expand(%o) - %o", bExpand, this);
		if( this.isExpanded == bExpand ) {
			logMsg("dtnode._expand(%o) IGNORED - %o", bExpand, this);
			return;
		}
		this.isExpanded = bExpand;
		var opts = this.tree.options;
		// Persist expand state
    	this.tree._changeNodeList("expand", this, bExpand);

        if( bExpand ) {
			$(this.span).addClass(opts.classNames.expanded);
        } else {
			$(this.span).removeClass(opts.classNames.expanded);
        }
        // Auto-collapse mode: collapse all siblings
		if( this.isExpanded && this.parent && opts.autoCollapse ) {
			var parents = this._parentList(false, true);
			for(var i=0; i<parents.length; i++)
				parents[i].collapseSiblings();
		}
		// If current focus is now hidden, focus the first visible parent.
		// TODO: doesn't make sense here(?) we should check if the currently focused node (not <this>) is visible.
		// At the moment, _expand gets only called, after focus was set to <this>.
		if( ! this.isExpanded && ! this.isVisible() ) {
			logMsg("Focus became invisible: setting to this.");
			this.focus();
		}
		// If currently active node is now hidden, deactivate it
		if( opts.activeVisible && this.tree.activeNode && ! this.tree.activeNode.isVisible() ) {
			this.tree.activeNode.deactivate();
		}
		// Expanding a lazy node: set 'loading...' and call callback
		if( bExpand && this.data.isLazy && !this.isRead ) {
			try {
				this.setLazyNodeStatus(DTNodeStatus_Loading);
				if( true == opts.onLazyRead.call(this.span, this) ) {
					// If function returns 'true', we assume that the loading is done:
					this.setLazyNodeStatus(DTNodeStatus_Ok);
					// Otherwise (i.e. if the loading was started as an asynchronous process)
					// the onLazyRead(dtnode) handler is expected to call dtnode.setLazyNodeStatus(DTNodeStatus_Ok/_Error) when done.
				}
			} catch(e) {
				this.setLazyNodeStatus(DTNodeStatus_Error);
			}
			return;
		}
		if( opts.fx ) {
			var duration = opts.fx.duration || 200;
			$(">DIV", this.div).animate(opts.fx, duration);
		}else {
			$(">DIV", this.div).toggle();
		}
	},

	toggleExpand: function() {
		logMsg("toggleExpand("+this.data.title+")...");
		if( !this.childList && !this.data.isLazy )
			return;
		if( this.parent == null && this.tree.options.minExpandLevel>0 )
			return;
		this._expand( ! this.isExpanded);
		logMsg("toggleExpand("+this.data.title+") done.");
	},

	collapseSiblings: function() {
		if( this.parent == null )
			return;
		var ac = this.parent.childList;
		for (var i=0; i<ac.length; i++) {
			if ( ac[i] !== this && ac[i].isExpanded )
				ac[i]._expand(false);
		}
	},

	onClick: function(event) {
		logMsg("dtnode.onClick(" + event.type + "): dtnode:" + this + ", button:" + event.button + ", which: " + event.which);

		if( $(event.target).hasClass(this.tree.options.classNames.expander) ) {
			// Clicking the expander icon always expands/collapses
			this.toggleExpand();
		} else if( $(event.target).hasClass(this.tree.options.classNames.checkbox) ) {
			// Clicking the checkbox always (de)selects
			this.toggleSelect();
		} else {
			this._userActivate();
			// Chrome and Safari don't focus the a-tag on click
//			logMsg("a tag: ", this.span.getElementsByTagName("a")[0]);
			this.span.getElementsByTagName("a")[0].focus();
//			alert("hasFocus=" + this.span.getElementsByTagName("a")[0].focused);
		}
		// Make sure that clicks stop, otherwise <a href='#'> jumps to the top
		return false;
	},

	onDblClick: function(event) {
		logMsg("dtnode.onDblClick(" + event.type + "): dtnode:" + this + ", button:" + event.button + ", which: " + event.which);
/*		
		if ( this.data.isFolder && ( this.childList || this.data.isLazy )
			&& (this.parent != null || this.tree.options.rootCollapsible)
			) {
			this.toggleExpand();
		}
*/
	},

	onKeydown: function(event) {
		logMsg("dtnode.onKeydown(" + event.type + "): dtnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
		var handled = true;
//		alert("keyDown" + event.which);

		switch( event.which ) {
			// charCodes:
//			case 43: // '+'
			case 107: // '+'
			case 187: // '+' @ Chrome, Safari
				if( !this.isExpanded ) this.toggleExpand();
				break;
//			case 45: // '-'
			case 109: // '-'
			case 189: // '+' @ Chrome, Safari
				if( this.isExpanded ) this.toggleExpand();
				break;
			//~ case 42: // '*'
				//~ break;
			//~ case 47: // '/'
				//~ break;
			// case 13: // <enter>
				// <enter> on a focused <a> tag seems to generate a click-event. 
				// this._userActivate();
				// break;
			case 32: // <space>
				this._userActivate();
				break;
			case 08: // <backspace>
				if( this.parent )
					this.parent.focus();
				break;
			case 37: // <left>
				if( this.isExpanded ) {
					this.toggleExpand();
					this.focus();
				} else if( this.parent && (this.tree.options.rootVisible || this.parent.parent) ) {
					this.parent.focus();
				}
				break;
			case 39: // <right>
				if( !this.isExpanded && (this.childList || this.data.isLazy) ) {
					this.toggleExpand();
					this.focus();
				} else if( this.childList ) {
					this.childList[0].focus();
				}
				break;
			case 38: // <up>
				var sib = this.prevSibling();
				while( sib && sib.isExpanded )
					sib = sib.childList[sib.childList.length-1];
				if( !sib && this.parent && (this.tree.options.rootVisible || this.parent.parent) )
					sib = this.parent;
				if( sib ) sib.focus();
				break;
			case 40: // <down>
				var sib;
				if( this.isExpanded ) {
					sib = this.childList[0];
				} else {
					var parents = this._parentList(false, true);
					for(var i=parents.length-1; i>=0; i--) {
						sib = parents[i].nextSibling();
						if( sib ) break;
					}
				}
				if( sib ) sib.focus();
				break;
			default:
				handled = false;
		}
		// Return false, if handled, to prevent default processing
		return !handled; 
	},

	onKeypress: function(event) {
		// onKeypress is only hooked to allow user callbacks.
		// We don't process it, because IE and Safari don't fire keypress for cursor keys.
		logMsg("dtnode.onKeypress(" + event.type + "): dtnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
	},
	
	onFocus: function(event) {
		// Handles blur and focus events.
//		logMsg("dtnode.onFocus(%o): %o", event, this);
		var opts = this.tree.options;
		if ( event.type=="blur" || event.type=="focusout" ) {
			if ( opts.onBlur ) // Pass element as 'this' (jQuery convention)
				opts.onBlur.call(this.span, this);
			if( this.tree.tnFocused )
				$(this.tree.tnFocused.span).removeClass(opts.classNames.focused);
			this.tree.tnFocused = null;
	        if( opts.persist )
				$.cookie(opts.cookieId+"-focus", null);
		} else if ( event.type=="focus" || event.type=="focusin") {
			// Fix: sometimes the blur event is not generated
			if( this.tree.tnFocused && this.tree.tnFocused !== this ) {
				logMsg("dtnode.onFocus: out of sync: curFocus: %o", this.tree.tnFocused);
				$(this.tree.tnFocused.span).removeClass(opts.classNames.focused);
			}
			this.tree.tnFocused = this;
			if ( opts.onFocus ) // Pass element as 'this' (jQuery convention)
				opts.onFocus.call(this.span, this);
			$(this.tree.tnFocused.span).addClass(opts.classNames.focused);
	        if( opts.persist )
				$.cookie(opts.cookieId+"-focus", this.data.key);
		}
		// TODO: return anything?
//		return false;
	},

	_postInit: function() {
		// Called, when childs have been loaded.
		
	},
		
	visit: function(fn, data, includeSelf) {
		// Call fn(dtnode, data) for all child nodes. Stop iteration, if fn() returns false.
		var n = 0;
		if( includeSelf == true ) {
			if( fn(this, data) == false )
				return 1; 
			n++; 
		}
		if ( this.childList )
			for (var i=0; i<this.childList.length; i++)
				n += this.childList[i].visit(fn, data, true);
		return n;
	},

	remove: function() {
        // Remove this node
//		logMsg ("%o.remove()", this);
        if ( this === this.tree.root )
            return false;
        return this.parent.removeChild(this);
	},

	removeChild: function(tn) {
		var ac = this.childList;
		if( ac.length == 1 ) {
			if( tn !== ac[0] )
				throw "removeChild: invalid child";
			return this.removeChildren();
		}
        if ( tn === this.tree.activeNode )
        	tn.deactivate();
		tn.removeChildren(true);
		this.div.removeChild(tn.div);
		for(var i=0; i<ac.length; i++) {
			if( ac[i] === tn ) {
				this.childList.splice(i, 1);
				delete tn;
				break;
			}
		}
	},

	removeChildren: function(recursive) {
        // Remove all child nodes (more efficient than recursive remove())
//		logMsg ("%o.removeChildren(%o)", this, recursive);
		var tree = this.tree;
        var ac = this.childList;
        if( ac ) {
        	for(var i=0; i<ac.length; i++) {
				var tn=ac[i];
//        		logMsg ("del %o", tn);
                if ( tn === tree.activeNode )
                	tn.deactivate();
                tn.removeChildren(true);
				this.div.removeChild(tn.div);
                delete tn;
        	}
        	this.childList = null;
			if( ! recursive ) {
				this._expand(false);
				this.isRead = false;
				this.render(false, false);
			}
        }
	},

	_addChildNode: function (dtnode) {
//		logMsg ("%o._addChildNode(%o)", this, dtnode);
		if ( this.childList==null ) {
			this.childList = new Array();
		} else {
			// Fix 'lastsib'
			$(this.childList[this.childList.length-1].span).removeClass(this.tree.options.classNames.lastsib);
		}

		this.childList.push (dtnode);
		dtnode.parent = this;

		// Expand the parent, if
		// 1. this is the root node, and the root node is invisible
		// 2. this is the root node, and the root node is defined as always open
		if ( ( (this.tree.options.minExpandLevel>0 || !this.tree.options.rootVisible) && this.parent==null )
			 || ( dtnode.data.expand )
			 ) {
			this.isExpanded = true;
		}
		if ( this.tree.bEnableUpdate )
			this.render(true, true);

		return dtnode;
	},

	_addNode: function(data) {
//		logMsg ("%o._addNode(%o)", this, data);
		var dtnode = new DynaTreeNode(this.tree, data);
		return this._addChildNode(dtnode);
	},

	append: function(obj) {
		/*
		Data format: array of node objects, with optional 'children' attributes.
		[
			{ title: "t1", isFolder: true, ... }
			{ title: "t2", isFolder: true, ...,
				children: [
					{title: "t2.1", ..},
					{..}
					]
			}
		]
		A simple object is also accepted instead of an array.
		*/
//		logMsg ("%o.append(%o)", this, obj);
		if( !obj || obj.length==0 ) // Passed null or undefined or empty array
			return;
		if( !obj.length ) // Passed a single node
			return this._addNode(obj);

		var prevFlag = this.tree.enableUpdate(false);

		var tnFirst = null;
		for (var i=0; i<obj.length; i++) {
			var data = obj[i];
			var dtnode = this._addNode(data);
			if( !tnFirst ) tnFirst = dtnode;
			if( data.children )
				dtnode.append(data.children);
		}
		this.tree.enableUpdate(prevFlag);
		return tnFirst;
	},

	appendAjax: function(ajaxOptions) {
		this.setLazyNodeStatus(DTNodeStatus_Loading);
		// Ajax option inheritance: $.ajaxSetup < $.ui.dynatree.defaults.ajaxDefaults < tree.options.ajaxDefaults < ajaxOptions
		var self = this;
		var ajaxOptions = $.extend({}, this.tree.options.ajaxDefaults, ajaxOptions, {
       		success: function(data, textStatus){
				self.append(data);
				self.setLazyNodeStatus(DTNodeStatus_Ok);
       			},
       		error: function(XMLHttpRequest, textStatus, errorThrown){
				self.setLazyNodeStatus(DTNodeStatus_Error);
       			}
		});
       	$.ajax(ajaxOptions);
	},
	// --- end of class
	lastentry: undefined
}

/*************************************************************************
 * class DynaTree
 */

var DynaTree = Class.create();

DynaTree.prototype = {
	// static members
	version: "$Version:",
	// Constructor
	initialize: function(id, options) {
//		logMsg ("DynaTree.initialize()");
		// instance members
		this.options = options;

		this.bEnableUpdate = true;
		this.isDisabled = false;
		this._nodeCount = 0;

		// Initial status is read from cookies, if persistence is active and 
		// cookies are already present.
		// Otherwise the status is read from the data attributes and then persisted.
		this.initMode = "data";

		this.activeNode = null;
		this.selectedNodes = new Array();
		this.expandedNodes = new Array();

		if( this.options.persist ) {
			// Requires jquery.cookie.js:
			this.initActiveKey = $.cookie(this.options.cookieId + "-active");
			if( cookie || this.initActiveKey != null )
				this.initMode = "cookie";

			this.initFocusKey = $.cookie(this.options.cookieId + "-focus");

			var cookie = $.cookie(this.options.cookieId + "-expand");
			this.initExpandedKeys = cookie ? cookie.split(",") : [];

			cookie = $.cookie(this.options.cookieId + "-select");
			this.initSelectedKeys = cookie ? cookie.split(",") : [];
		}
		logMsg("initMode: %o, active: %o, expanded: %o, selected: %o", this.initMode, this.initActiveKey, this.initExpandedKeys, this.initSelectedKeys);

		// Cached tag strings
		this.cache = {
			tagEmpty: "<span class='" + options.classNames.empty + "'></span>",
			tagVline: "<span class='" + options.classNames.vline + "'></span>",
			tagExpander: "<span class='" + options.classNames.expander + "'></span>",
			tagConnector: "<span class='" + options.classNames.connector + "'></span>",
			tagNodeIcon: "<span class='" + options.classNames.nodeIcon + "'></span>",
			tagCheckbox: "<span class='" + options.classNames.checkbox + "'></span>",
			lastentry: undefined
		};

		// find container element
		this.divTree = document.getElementById(id);
		// create the root element
		this.tnRoot = new DynaTreeNode(this, {title: this.options.title, key: this.options.idPrefix+"root"});
		this.tnRoot.data.isFolder = true;
		this.tnRoot.render(false, false);
		this.divRoot = this.tnRoot.div;
		this.divRoot.className = this.options.classNames.container;
		// add root to container
		this.divTree.appendChild(this.divRoot);
	},

	// member functions

	toString: function() {
		return "DynaTree '" + this.options.title + "'";
	},
	
	_changeNodeList: function(mode, node, bAdd) {
		// Add or remove key from a key list and optionally write cookie.
		if( !node )
			return false;
		var cookieName = this.options.cookieId + "-" + mode;
		var nodeList = ( mode=="expand" ) ? this.expandedNodes : this.selectedNodes;  
		var idx = $.inArray(node, nodeList);
		logMsg("_changeNodeList: nodeList:%o, idx:%o", nodeList, idx);
		if( bAdd ) {
			if( idx >=0 )
				return false;
			nodeList.push(node);
		} else {
			if( idx < 0 )
				return false;
			nodeList.splice(idx, 1);
		}
		logMsg("  -->: nodeList:%o", nodeList);
		if( this.options.persist ) {
			var keyList = $.map(nodeList, function(e,i){return e.data.key});
			logMsg("_changeNodeList: write cookie <%s> = '%s'", cookieName, keyList.join("', '"));
			$.cookie(cookieName, keyList.join(","));
		} else {
			logMsg("_changeNodeListCookie: %o", nodeList);
		}
	},
	
/*
	persist: function() {
		logMsg("dynatree.persist(): active: %o, expanded: %o", this.activeNode, this.expandedNodes);
		var opts = this.options;
		$.cookie(opts.cookieId+"-active", this.activeNode ? this.activeNode.data.key : "");
		$.cookie(opts.cookieId+"-focus", this.focusNode ? this.focusNode.data.key : null);
		
		var keyList = $.map(this.expandedNodes, function(e,i){ e.data.key; });
		$.cookie(opts.cookieId+"-expand", keyList.join(","));
		logMsg("Write cookie: <%s> = '%s'", opts.cookieId+"-expand", keyList.join(","));

		keyList = $.map(this.selectedNodes, function(e,i){ e.data.key; });
		$.cookie(opts.cookieId+"-select", keyList.join(","));
		logMsg("Write cookie: <%s> = '%s'", opts.cookieId+"-select", keyList.join(","));
	},
*/
	redraw: function() {
		logMsg("dynatree.redraw()...");
		this.tnRoot.render(true, true);
		logMsg("dynatree.redraw() done.");
	},

	getRoot: function() {
		return this.tnRoot;
	},

	getNodeByKey: function(key) {
		// $("#...") has problems, if the key contains '.', so we use getElementById()
//		return $("#" + this.options.idPrefix + key).attr("dtnode");
		var el = document.getElementById(this.options.idPrefix + key);
		return ( el && el.dtnode ) ? el.dtnode : null;
	},

	getActiveNode: function() {
		return this.activeNode;
	},

	getSelectedNodes: function() {
		return this.selectedNodes;
	},

	activateKey: function(key) {
		var dtnode = this.getNodeByKey(key);
		if( !dtnode ) {
			this.activeNode = null;
			return null;
		}
		dtnode.focus();
		dtnode.activate();
		return dtnode;
	},

	selectKey: function(key, select) {
		var dtnode = this.getNodeByKey(key);
		if( !dtnode )
			return null;
		dtnode.select(select);
		return dtnode;
	},

	enableUpdate: function(bEnable) {
		if ( this.bEnableUpdate==bEnable )
			return bEnable;
		this.bEnableUpdate = bEnable;
		if ( bEnable )
			this.redraw();
		return !bEnable; // return previous value
	},

	_createFromTag: function(parentTreeNode, $ulParent) {
		// Convert a <UL>...</UL> list into children of the parent tree node.
		var self = this;
/*
TODO: better?
		this.$lis = $("li:has(a[href])", this.element);
		this.$tabs = this.$lis.map(function() { return $("a", this)[0]; });
 */
		$ulParent.find(">li").each(function() {
			var $li = $(this);
			var $liSpan = $li.find(">span:first");
			var title;
			if( $liSpan.length ) {
				// If a <li><span> tag is specified, use it literally.
				title = $liSpan.html();
			} else {
				// If only a <li> tag is specified, use the trimmed string up to the next child <ul> tag.
				title = $.trim($li.html().match(/.*(<ul)?/)[0]);
			}
			// Parse node options from ID, title and class attributes
			var data = {
				title: title,
				isFolder: $li.hasClass("folder"),
				isLazy: $li.hasClass("lazy"),
				expand: $li.hasClass("expanded"),
				select: $li.hasClass("selected"),
				activate: $li.hasClass("active"),
				focus: $li.hasClass("focused")
			};
			if( $li.attr("title") )
				data.tooltip = $li.attr("title");
			if( $li.attr("id") )
				data.key = $li.attr("id");
			// If a data attribute is present, evaluate as a javascript object
			if( $li.attr("data") ) {
				var dataAttr = $.trim($li.attr("data"));
				if( dataAttr ) {
					if( dataAttr.charAt(0) != "{" )
						dataAttr = "{" + dataAttr + "}"
					try {
						$.extend(data, eval("(" + dataAttr + ")"));
					} catch(e) {
						throw ("Error parsing node data: " + e + "\ndata:\n'" + dataAttr + "'");
					}
				}
			}
			childNode = parentTreeNode._addNode(data);
			// Recursive reading of child nodes, if LI tag contains an UL tag
			var $ul = $li.find(">ul:first");
			if( $ul.length ) {
				self._createFromTag(childNode, $ul); // must use 'self', because 'this' is the each() context
			}
		});
	},
	// --- end of class
	lastentry: undefined
};

/*************************************************************************
 * widget $(..).dynatree
 */


$.widget("ui.dynatree", {
	init: function() {
        // ui.core 1.6 renamed init() to _init(): this stub assures backward compatibility
        logMsg("ui.dynatree.init() was called, you should upgrade to ui.core.js v1.6 or higher.");
        return this._init();
    },

	_init: function() {
		// The widget framework supplies this.element and this.options.
		this.options.event += ".dynatree"; // namespace event

		// Create DynaTree
		var $this = this.element;
		var opts = this.options;

		//  Migration helper (2008-11-30)
		if( opts.selectExpandsFolders == false )
			alert("Dynatree option 'selectExpandsFolders' is deprecated. Use 'clickFolderMode' instead.");
		
		// Guess skin path, if not specified
		if(!opts.imagePath) {
			$("script").each( function () {
				if( this.src.search(/.*dynatree[^/]*\.js$/i) >= 0 ) {
                    if( this.src.indexOf("/")>=0 ) // issue #47
					    opts.imagePath = this.src.slice(0, this.src.lastIndexOf("/")) + "/skin/";
                    else
					    opts.imagePath = "skin/";
					logMsg("Guessing imagePath from '%s': '%s'", this.src, opts.imagePath);
					return false; // first match
				}
			});
		}
		// Attach the tree object to parent element
		var id = $this.attr("id");
		this.tree = new DynaTree(id, opts);
		var root = this.tree.getRoot();

		// Init tree structure
//		this.tree.isInitializing = true;

		if( opts.children ) {
			// Read structure from node array
			root.append(opts.children);

		} else if( opts.initAjax && opts.initAjax.url ) {
			// Init tree from AJAX request
			root.appendAjax(opts.initAjax);

		} else if( opts.initId ) {
			// Init tree from another UL element
			this.tree._createFromTag(root, $("#"+opts.initId));

		} else {
			// Init tree from the first UL element inside the container <div>
			var $ul = $this.find(">ul").hide();
			this.tree._createFromTag(root, $ul);
			$ul.remove();
		}

		// bind event handlers
		this.bind();

        // Fire select events for all node that were initialized as 'selected'
		this.tree.initMode = "postInit";
		
		root._postInit();
		
		var nodeList = this.tree.expandedNodes;
		this.tree.expandedNode = [];
		for(var i=0; i<nodeList.length; i++ ) {
			var dtnode = nodeList[i];
			logMsg("Expand on init: %o", dtnode);
//			dtnode.isExpanded = false; // make sure this is not ignored
			dtnode._expand(true);
		}
		nodeList = this.tree.selectedNodes;
		this.tree.selectedNodes = [];
		for(var i=0; i<nodeList.length; i++ ) {
			var dtnode = nodeList[i];
			logMsg("Select on init: %o", dtnode);
			dtnode.isSelected = false; // make sure this is not ignored
			dtnode.select(true);
		}
		// Activate node, that was initialized as 'active'
		if( this.tree.activeNode ) {
			var dtnode = this.tree.activeNode;
			this.tree.activeNode = null; // make sure this is not ignored
			logMsg("Activate on init: %o", dtnode);
			dtnode._userActivate();
		}
		
		// Focus, that was initialized as 'active'
		if( this.tree.focusNode ) {
			logMsg("Focus on init: %o", dtnode);
			this.tree.focusNode.focus();
		}
		this.tree.initMode = "running";
		
		//
/*		
		if( opts.focusRoot ) {
			if( opts.rootVisible ) {
				root.focus();
			} else if( root.childList && ! (opts.initAjax && opts.initAjax.url) ) {
				// Only if not lazy initing (Will be handled by setLazyNodeStatus(DTNodeStatus_Ok))
				root.childList[0].focus();
			}
		}
*/
		// EVENTS
/*
		// clean up to avoid memory leaks in certain versions of IE 6
		$(window).bind("unload", function() {
			self.$tabs.unbind(".tabs");
			self.$lis = self.$tabs = self.$panels = null;
		});
*/
		logMsg("this.options: %o", this.options);
	},

	bind: function() {
		var $this = this.element;
		var o = this.options;
		// EVENTS
		// Register events sources
//		this.$tabs.unbind(".tabs").bind(o.event, function() {
//		}
		// Prevent duplicate binding
		this.unbind();
		
		// Tool function to get dtnode from the event target:
		function __getNodeFromElement(el) {
			var iMax = 4;
			do {
				if( el.dtnode ) return el.dtnode;
				el = el.parentNode;
			} while( iMax-- );
			return null;
		}

		$this.bind("click.dynatree dblclick.dynatree keypress.dynatree keydown.dynatree ", function(event){
			var dtnode = __getNodeFromElement(event.target);
			
			logMsg("bind(" + event.type + "): dtnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
			if( !dtnode )
				return false;

			switch(event.type) {
			case "click":
				return ( o.onClick && o.onClick(dtnode, event)===false ) ? false : dtnode.onClick(event);
			case "dblclick":
				return ( o.onDblClick && o.onDblClick(dtnode, event)===false ) ? false : dtnode.onDblClick(event);
			case "keydown":
				return ( o.onKeydown && o.onKeydown(dtnode, event)===false ) ? false : dtnode.onKeydown(event);
			case "keypress":
				return ( o.onKeypress && o.onKeypress(dtnode, event)===false ) ? false : dtnode.onKeypress(event);
			};
		});
		
		// focus/blur don't bubble, i.e. are not delegated to parent <div> tags,
		// so we use the addEventListener capturing phase.
		// See http://www.howtocreate.co.uk/tutorials/javascript/domevents
		function __focusHandler(event) {
			// Handles blur and focus.
			// Fix event for IE:
			event = arguments[0] = $.event.fix( event || window.event );
			var dtnode = __getNodeFromElement(event.target);
			return dtnode ? dtnode.onFocus(event) : false;
		}
		var div = this.tree.divTree;
		if( div.addEventListener ) {
			div.addEventListener("focus", __focusHandler, true);
			div.addEventListener("blur", __focusHandler, true);
		} else {
			div.onfocusin = div.onfocusout = __focusHandler;
		}
		// EVENTS
		// disable click if event is configured to something else
//		if (!(/^click/).test(o.event))
//			this.$tabs.bind("click.tabs", function() { return false; });
		
	},
	
	unbind: function() {
		this.element.unbind(".dynatree");
	},
	
	enable: function() {
		this.bind();
		// Enable and remove -disabled from css: 
		this._setData("disabled", false);
	},
	
	disable: function() {
		this.unbind();
		// Disable and add -disabled to css: 
		this._setData("disabled", true);
	},
	
	// --- getter methods (i.e. NOT returning a reference to $)
	getTree: function() {
		return this.tree;
	},

	getRoot: function() {
		return this.tree.getRoot();
	},

	getActiveNode: function() {
		return this.tree.getActiveNode();
	},

	getSelectedNodes: function() {
		return this.tree.getSelectedNodes();
	},

	// ------------------------------------------------------------------------
	lastentry: undefined
});


// The following methods return a value (thus breaking the jQuery call chain):

$.ui.dynatree.getter = "getTree getRoot getActiveNode getSelectedNodes";


// Plugin default options:

$.ui.dynatree.defaults = {
	title: "Dynatree root", // Name of the root node.
	rootVisible: false, // Set to true, to make the root node visible.
//	rootCollapsible: false, // Prevent root node from being collapsed.
 	minExpandLevel: 1, // 1: root node is not collapsible
	imagePath: null, // Path to a folder containing icons. Defaults to 'skin/' subdirectory.
	children: null, // Init tree structure from this object array.
	initId: null, // Init tree structure from a <ul> element with this ID.
	initAjax: null, // Ajax options used to initialize the tree strucuture.
//	focusRoot: true, // Set focus to root node on init.
	autoFocus: true, // Set focus to first child, when expanding or lazy-loading.
	keyboard: true, // Support keyboard navigation.
	autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
//	expandOnAdd: false, // Automatically expand parent, when a child is added.
	clickFolderMode: 3, // 1:activate, 2:expand, 3:activate and expand
	activeVisible: true, // Make sure, active nodes are visible (expanded).
	checkbox: false, // Show checkbox
	selectMode: 2, // 1:single, 2:multi, 3:multi-hier
	fx: null, // Animations, e.g. null or { height: "toggle", duration: 200 }

	// Low level event handlers: onEvent(dtnode, event): return false, to stop default processing
	onClick: null, // null: generate onActivate, ...
	onDblClick: null, // null: generate onFocus, ...
	onKeydown: null, // null:  
	onKeypress: null, // null: 
	onFocus: null, // Callback when a node receives focus.
	onBlur: null, // Callback when a node looses focus.

	// Pre-event handlers onQueryEvent(flag, dtnode): return false, to stop processing
	onQueryActivate: null, // Callback before a node is (de)activated.
	onQuerySelect: null, // Callback before a node is (de)selected.
	onQueryExpand: null, // Callback before a node is expanded/collpsed.
	
	// High level event handlers
	onActivate: null, // Callback when a node is activated.
	onDeactivate: null, // Callback when a node is deactivated.
	onSelect: null, // Callback when a node is selected.
//	onUnselect: null, // Callback when a node is deselected.
	onExpand: null, // Callback when a node is expanded.
	onCollapse: null, // Callback when a node is collapsed.
	onLazyRead: null, // Callback when a lazy node is expanded for the first time.
	
	ajaxDefaults: { // Used by initAjax option
		cache: false, // Append random '_' argument to url to prevent caching.
		dataType: "json" // Expect json format and pass json object to callbacks.
	},
	strings: {
		loading: "Loading&#8230;",
		loadError: "Load error!"
	},
	idPrefix: "ui-dynatree-id-", // Used to generate node id's like <span id="ui-dynatree-id-<key>">.
	classNames: {
		container: "ui-dynatree-container",
		folder: "ui-dynatree-folder",
		document: "ui-dynatree-document",
		empty: "ui-dynatree-empty",
		vline: "ui-dynatree-vline",
		expander: "ui-dynatree-expander",
		connector: "ui-dynatree-connector",
		checkbox: "ui-dynatree-checkbox",
		nodeIcon: "ui-dynatree-icon",
		hidden: "ui-dynatree-hidden",
//		disabled: "ui-dynatree-disabled",
		active: "ui-dynatree-active",
		selected: "ui-dynatree-selected",
		expanded: "ui-dynatree-expanded",
		lazy: "ui-dynatree-lazy",
		focused: "ui-dynatree-focused",
		partsel: "ui-dynatree-partsel",
		lastsib: "ui-dynatree-lastsib"
	},
	debugLevel: 0,
    persist: false, // Persist expand-status to a cookie
    cookieId: "ui-dynatree-cookie", // Choose a more unique name, to allow multiple trees.
/*
 	cookie: {
		expires: 7, // Days or Date; null: session cookie
		path: "/", // Defaults to current page
		domain: "jquery.com",
		secure: true
	},
*/

	// ### copied from ui.tabs
	// basic setup
//  history: false,

	// templates
	//~ tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a></li>',
	// 		var $li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label));
	//~ panelTemplate: "<div></div>"
	// ------------------------------------------------------------------------
	lastentry: undefined
};

/**
 * Reserved data attributes for a tree node.
 */
$.ui.dynatree.nodedatadefaults = {
	title: null, // (required) Displayed name of the node (html is allowed here)
	key: null, // May be used with select(), find(), ...
	isFolder: false, // Use a folder icon. Also the node is expandable but not selectable.
	isLazy: false, // Call onLazyRead(), when the node is expanded for the first time to allow for delayed creation of children.
	tooltip: null, // Show this popup text.
	icon: null, // Use a custom image (filename relative to tree.options.imagePath). 'null' for default icon, 'false' for no icon.
	activate: false, // Initial active status.
	focus: false, // Initial focused status.
	expand: false, // Initial expanded status.
	select: false, // Initial selected status.
//	hideCheckbox: null, // Suppress checkbox for this node.
//	unselectable: false, // Prevent selection.
	// The following attributes are only valid if passed to some functions:
	children: null, // Array of child nodes.
	// NOTE: we can also add custom attributes here.
	// This may then also be used in the onSelect() or onLazyTree() callbacks.
	// ------------------------------------------------------------------------
	lastentry: undefined
};


// ---------------------------------------------------------------------------
})(jQuery);
