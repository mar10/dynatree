/*************************************************************************
	jquery.dynatree.js
	Dynamic tree view control, with support for lazy loading of branches.

	Copyright (c) 2008  Martin Wendt (http://wwWendt.de)
	Licensed under the MIT License (MIT-License.txt)

	A current version and some documentation are available at
		http://dynatree.googlecode.com/

	Let me know, if you find bugs or improvements (martin at domain wwWendt.de).

	$Version:$
	$Revision:$

 	@depends: jquery.js
 	@depends: ui.core.js
    @depends: jquery.cookie.js
*************************************************************************/

/* Changelog 0.3 -> 0.4
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
 * TODO
 *   - issue #61: allow image names + extensions
 *   - issue #56: <span class="ui-dynatree-title"> --> use a template?
 *   - data.isFolder -> folder, .isLazy -> lazy 
 *   - 'focus' attribute on init and in cookie
 *   - Test files for release: use minified libs 
 *   - issue # : use effects for expanding 
 *   - rework samples with better names and title, header explanation
 *   - remove focusRoot
 *   - unbind: auch focus handler entfernen
 *   - use opts.debugLevel instead of _bDebug
 *   - _expand wird für alle PArents 2x aufgerufen
 *   - $(this.span) --> $span
 *   - Table-Tree: use CSS 2.1: display:table, display:table-row, display:table-cell 
 *     --
 *   - Für das FX expandieren wird ein eigen <div> benötigt, dass die Children enthält
 *     Stattdessen muss das render nur noch aufgerufen werden ,wenn sich die struktur ändert
 *     (remove() insert(), ...
 *   - unselect -> deselect
 *   - onDblClick
 
	rootCollapsible --> minExpandLevel
	focusRoot: --> use 'focus' style
	clickFolderMode: --> nur im onClickHandler berücksichtigen
	checkbox: false, // Show checkbox
	selectMode: 0, // 0:off, 1:single, 2:multi, 3:multi-hier
	selectionVisible --> onSelect dtnode.makevisible
	?? autoCollapse --> onExpand dtnode.collapseSiblilings
 
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
var DTNodeStatus_Error   = -1;
var DTNodeStatus_Loading = 1;
var DTNodeStatus_Ok      = 0;

var DynaTreeNode = Class.create();

DynaTreeNode.prototype = {
	initialize: function(tree, data) {
		this.tree    = tree;
		if ( typeof data == "string" ) {
			this.data = { title: data };
		} else {
			this.data = $.extend({}, $.ui.dynatree.nodedatadefaults, data);
		}
		this.parent = null; // not yet added to a parent
		this.div = null; // not yet created
		this.span = null; // not yet created

		this.childList = null; // no subnodes yet
		this.isRead = false; // Lazy content not yet read
		this.isExpanded = ( data.expand == true ) ? true : false; // Collapsed by default
		this.isSelected = ( data.select == true ) ? true : false; // Unselected by default
		this.hasSubSel = false;
		if( data.activate )
			this.tree.initActiveNode = this;
		if( data.focus )
			this.tree.initFocusNode = this;

		if( this.tree.initCookie && this.isExpanded ) {
			// Initialize cookie from status stored in data.expand
			this.tree._changeExpandList(this.data.key, true, false);
		} else if( this.tree.options.persist && ! this.tree.initCookie && this.data.key ) {
			// Initialize expand state from cookie
//			logMsg("DynaTreeNode %o init: setting expanded-mode from cookie", this.data.key);
			this.isExpanded = ($.inArray(this.data.key, this.tree.expandedKeys) >= 0);
		}
	},

	toString: function() {
		return "DynaTreeNode '" + this.data.title + "', key=" + this.data.key;
	},

	_getInnerHtml: function() {
		var res = "";

		// parent connectors
		var bIsRoot = (this.parent==null);
		var bHideFirstConnector = ( !this.tree.options.rootVisible || !this.tree.options.rootCollapsible );

		var p = this.parent;
		var cache = this.tree.cache;
		while ( p ) {
			if ( ! (bHideFirstConnector && p.parent==null ) )
				res = ( p.isLastSibling() ? cache.tagL_ : cache.tagL_ns) + res ;
			p = p.parent;
		}

		// connector (expanded, expandable or simple)
		if ( bHideFirstConnector && bIsRoot  ) {
			// skip connector
		} else if ( this.childList && this.isExpanded  ) {
			res += ( this.isLastSibling() ? cache.tagM_ne : cache.tagM_nes );
		} else if (this.childList) {
			res += ( this.isLastSibling() ? cache.tagP_ne : cache.tagP_nes );
		} else if (this.data.isLazy) {
			res += ( this.isLastSibling() ? cache.tagD_ne : cache.tagD_nes );
		} else {
			res += ( this.isLastSibling() ? cache.tagL_ne : cache.tagL_nes );
		}
		
		// Checkbox mode
		if( this.tree.options.checkbox ) {
   			res += cache.tagCheckbox;
		}
		
		// folder or doctype icon
   		if ( this.data.icon ) {
    		res += "<img src='" + this.tree.options.imagePath + this.data.icon + "' alt='' />";
   		} else if ( this.data.icon == false ) {
        	// icon == false means 'no icon'
		} else {
   			res += cache.tagNodeIcon;
		}

		// node name
		var tooltip = ( this.data && typeof this.data.tooltip == "string" ) ? " title='" + this.data.tooltip + "'" : "";
		res +=  "<a href='#'" + tooltip + ">" + this.data.title + "</a>";
//		res +=  "<span href='#'" + tooltip + ">" + this.data.title + "</span>";
		return res;
	},

	render: function(bDeep, bHidden) {
		// 
		logMsg("%o.render()", this);
		// --- create <div><span>..</span></div> tags for this node
		if( ! this.div ) {
			this.div  = document.createElement("div");
			this.span = document.createElement("span");
			this.span.dtnode = this;
			if( this.data.key )
				this.span.id = this.tree.options.idPrefix + this.data.key;
			this.span.className = ( this.data.isFolder ) ? this.tree.options.classNames.folder : this.tree.options.classNames.document;

			this.div.appendChild(this.span);
			if ( this.parent )
				this.parent.div.appendChild(this.div);
		}
		// hide root?
		if( this.parent==null )
			this.span.style.display = ( this.tree.options.rootVisible ? "" : "none");
		// hide this node, if parent is collapsed
		this.div.style.display = ( this.parent==null || this.parent.isExpanded ? "" : "none");

		// set node connector images, links and text
		this.span.innerHTML = this._getInnerHtml();
		
		// Set classes for current status
		if( this.isExpanded )
			$(this.span).addClass(this.tree.options.classNames.expanded);
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
			firstChild.data = data;
			firstChild.render (false, false);
		} else {
			firstChild = this._addChildNode (new DynaTreeNode (this.tree, data));
			firstChild.data.isStatusNode = true;
		}
	},

	setLazyNodeStatus: function(lts) {
		switch( lts ) {
			case DTNodeStatus_Ok:
				this._setStatusNode(null);
				this.isRead = true;
/*
				if( this === this.tree.tnRoot && this.tree.options.focusRoot
					&& !this.tree.options.rootVisible && this.childList ) {
					// special case: using ajaxInit
					this.childList[0].focus();
				} else {
					this.focus();
				}
*/
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
//		logMsg("dtnode.focus(): %o", this);
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
		if( this.tree.isDisabled || this.data.isStatusNode )
			return;
		if( this.tree.activeNode ) {
			if( this.tree.activeNode === this )
				return;
			this.tree.activeNode.deactivate();
		}
		if( this.tree.options.activeVisible )
			this.makeVisible();
		this.tree.activeNode = this;
		$(this.span).addClass(this.tree.options.classNames.active);
		if ( this.tree.options.onActivate ) // Pass element as 'this' (jQuery convention)
			this.tree.options.onActivate.call(this.span, this);
	},

	deactivate: function() {
		logMsg("dtnode.deactivate(): %o", this);
		$(this.span).removeClass(this.tree.options.classNames.active);
		if( this.tree.activeNode === this ) {
			this.tree.activeNode = null;
			if ( this.tree.options.onDeactivate )
				this.tree.options.onDeactivate.call(this.span, this);
		}
	},

	_setSubSel: function(hasSubSel) {
		if( hasSubSel ) {
			this.hasSubSel = true;
//			$(this.span).find(">INPUT").addClass(this.tree.options.classNames.partsel);
			$(this.span).addClass(this.tree.options.classNames.partsel);
		} else {
			this.hasSubSel = false;
//			$(this.span).find(">INPUT").removeClass(this.tree.options.classNames.partsel);
			$(this.span).removeClass(this.tree.options.classNames.partsel);
		}
	},
	
	_select: function(sel, fireEvents, deep) {
		// Select - but not focus - this node.
		logMsg("dtnode._select(%o) - %o", sel, this);
		var opts = this.tree.options;
		if( this.tree.isDisabled || this.data.isStatusNode )
			return;
		var idx = $.inArray(this, this.tree.selectedNodes);
		if( sel ) {
			if( idx >= 0 ) 
				return; // Already selected: nothing to do
			if ( fireEvents && opts.onQuerySelect && opts.onQuerySelect.call(this.span, this, sel) == false )
				return; // Client returned false
			// Force sinlge-selection
			if( opts.selectMode==1 && this.tree.selectedNodes.length ) 
				this.tree.selectedNodes[0]._select(false, false, false);
			this.isSelected = true;
			$(this.span).addClass(opts.classNames.selected);
			this.tree.selectedNodes.push(this);
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
				opts.onSelect.call(this.span, this);

		} else {
			if( idx < 0 ) 
				return; // Not selected: nothing to do
			if ( fireEvents && opts.onQuerySelect && opts.onQuerySelect.call(this.span, this, sel) == false )
				return; // Callback returned false

			this.isSelected = false;
			$(this.span).removeClass(opts.classNames.selected);
			this.tree.selectedNodes.splice(idx, 1);
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
			if ( fireEvents && opts.onUnselect )
				opts.onUnselect.call(this.span, this);
		}
	},

	select: function(sel) {
		// Select - but not focus - this node.
		logMsg("dtnode.select(%o) - %o", sel, this);
		return this._select(sel, true, true);
	},

	toggleSelect: function() {
		logMsg("dtnode.toggleSelect() - %o", this);
		return this.select(!this.isSelected);
	},

	_expand: function (bExpand) {
//		logMsg("dtnode._expand(%o) - %o", bExpand, this);
		if( this.isExpanded == bExpand )
			return;
		this.isExpanded = bExpand;

		// Persist expand state
        if( this.tree.options.persist && this.data.key ) {
        	this.tree._changeExpandList(this.data.key, bExpand, true);
        }

        if( bExpand ) {
			$(this.span).addClass(this.tree.options.classNames.expanded);
        } else {
			$(this.span).removeClass(this.tree.options.classNames.expanded);
        }
        // Auto-collapse mode: collapse all siblings
		if( this.isExpanded && this.parent && this.tree.options.autoCollapse ) {
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
		if( this.tree.options.activeVisible && this.tree.activeNode && ! this.tree.activeNode.isVisible() ) {
			this.tree.activeNode.deactivate();
		}
		// Expanding a lazy node: set 'loading...' and call callback
		if( bExpand && this.data.isLazy && !this.isRead ) {
			try {
				this.setLazyNodeStatus(DTNodeStatus_Loading);
				if( true == this.tree.options.onLazyRead.call(this.span, this) ) {
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
		
// TODO		$(this.div).toggle();
		
		// render expanded nodes
		this.render (true, false);
		// we didn't render collapsed nodes, so we have to update the visibility of direct childs
		if( this.childList ) {
			for (var i=0; i<this.childList.length; i++) {
				this.childList[i].div.style.display = (this.isExpanded ? "" : "none");
			}
		}
	},

	toggleExpand: function() {
		logMsg("toggleExpand("+this.data.title+")...");
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

	_activate: function() {
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
		if( this.parent == null && !this.tree.options.rootCollapsible ) {
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

	onClick: function(event) {
		logMsg("dtnode.onClick(" + event.type + "): dtnode:" + this + ", button:" + event.button + ", which: " + event.which);

		if( $(event.target).hasClass(this.tree.options.classNames.expander) ) {
			// Clicking the [+] icon always expands/collapses
			this.toggleExpand();
		} else if( $(event.target).hasClass(this.tree.options.classNames.checkbox) ) {
			// Clicking the checkbox image always (de)selects
			this.toggleSelect();
		} else {
			this._activate();
		}
		// Make sure that clicks stop
		return false;
	},

	onDblClick: function(event) {
		logMsg("dtnode.onDblClick(" + event.type + "): dtnode:" + this + ", button:" + event.button + ", which: " + event.which);
		if ( this.data.isFolder && ( this.childList || this.data.isLazy )
			&& (this.parent != null || this.tree.options.rootCollapsible)
			) {
			this.toggleExpand();
		}
	},

	onKeypress: function(event) {
		logMsg("dtnode.onKeypress(" + event.type + "): dtnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
		var code = ( ! event.charCode ) ? 1000+event.keyCode : event.charCode;
		var handled = true;

		switch( code ) {
			// charCodes:
			case 43: // '+'
				if( !this.isExpanded ) this.toggleExpand();
				break;
			case 45: // '-'
				if( this.isExpanded ) this.toggleExpand();
				break;
			//~ case 42: // '*'
				//~ break;
			//~ case 47: // '/'
				//~ break;
			case 1032: // <space>
			case 32: // <space>
				this._activate();
				break;
			// keyCodes
			case 1008: // <backspace>
				if( this.parent )
					this.parent.focus();
				break;
			case 1037: // <left>
				if( this.isExpanded ) {
					this.toggleExpand();
					this.focus();
				} else if( this.parent && (this.tree.options.rootVisible || this.parent.parent) ) {
					this.parent.focus();
				}
				break;
			case 1039: // <right>
				if( !this.isExpanded && (this.childList || this.data.isLazy) ) {
					this.toggleExpand();
					this.focus();
				} else if( this.childList ) {
					this.childList[0].focus();
				}
				break;
			case 1038: // <up>
				var sib = this.prevSibling();
				while( sib && sib.isExpanded )
					sib = sib.childList[sib.childList.length-1];
				if( !sib && this.parent && (this.tree.options.rootVisible || this.parent.parent) )
					sib = this.parent;
				if( sib ) sib.focus();
				break;
			case 1040: // <down>
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
			//~ case 1013: // <enter>
				//~ this.select();
				//~ break;
			default:
				handled = false;
		}
		if( handled )
			return false;
	},

	onFocus: function(event) {
		// Handles blur and focus events.
//		logMsg("dtnode.onFocus(%o): %o", event, this);
		if ( event.type=="blur" || event.type=="focusout" ) {
			if ( this.tree.options.onBlur ) // Pass element as 'this' (jQuery convention)
				this.tree.options.onBlur.call(this.span, this);
			if( this.tree.tnFocused )
				$(this.tree.tnFocused.span).removeClass(this.tree.options.classNames.focused);
			this.tree.tnFocused = null;
		} else if ( event.type=="focus" || event.type=="focusin") {
			// Fix: sometimes the blur event is not generated
			if( this.tree.tnFocused && this.tree.tnFocused !== this ) {
				logMsg("dtnode.onFocus: out of sync: curFocus: %o", this.tree.tnFocused);
				$(this.tree.tnFocused.span).removeClass(this.tree.options.classNames.focused);
			}
			this.tree.tnFocused = this;
			if ( this.tree.options.onFocus ) // Pass element as 'this' (jQuery convention)
				this.tree.options.onFocus.call(this.span, this);
			$(this.tree.tnFocused.span).addClass(this.tree.options.classNames.focused);
		}
		// TODO: return anything?
//		return false;
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
		if ( this.childList==null )
			this.childList = new Array();
		this.childList.push (dtnode);
		dtnode.parent = this;

		// Expand the parent, if
		// 1. expandOnAdd is set
		// 2. this is the root node, and the root node is invisible
		// 3. this is the root node, and the root node is defined as always open
		if ( this.tree.options.expandOnAdd
			 || ( (!this.tree.options.rootCollapsible || !this.tree.options.rootVisible) && this.parent==null )
			 || ( dtnode.data.expand )
			 ) {
			this.isExpanded = true;
			if( this.tree.initCookie )
				this.tree._changeExpandList(this.key, true, false);
		}
//		logMsg("%o: %o, %o", this, this.tree.isInitializing, dtnode.data.select)
		if( this.tree.isInitializing ) {
			if( dtnode.data.focus )
				this.tree.initFocusNode = dtnode;
			if( dtnode.data.select )
				this.tree.initSelectedNodes.push(dtnode);
		}
		if ( this.tree.bEnableUpdate )
			this.render (true, true);

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
	// constructor
	initialize: function(id, options) {
//		logMsg ("DynaTree.initialize()");
		// instance members
		this.options = options;

		this.activeNode = null;
		this.selectedNodes = new Array();
		this.bEnableUpdate = true;
		this.isDisabled = false;

		// list of expanded nodes (only maintained while initializing)
		this.initFocusNode = null;
		this.initActiveNode = null;
		this.initSelectedNodes = new Array();

		// list of expanded node keys (only maintained in persist mode)
		this.expandedKeys = new Array();

		this.initCookie = false;
		if( this.options.persist ) {
			// Requires jquery.cookie.js:
			var cookie = $.cookie(this.options.cookieId);
			if( cookie ) {
				this.expandedKeys = cookie.split(",");
			} else {
				this.initCookie = true; // Init first time persistence from node.data
			}
//			logMsg("Read cookie: %o, initCookie: %o", this.expandedKeys, this.initCookie);
		}

		// Cached tags
		this.cache = {
			tagFld: "<img src='" + options.imagePath + "ltFld.gif' alt='' />",
			tagFld_o: "<img src='" + options.imagePath + "ltFld_o.gif' alt='' />",
			tagDoc: "<img src='" + options.imagePath + "ltDoc.gif' alt='' />",
			tagL_ns: "<img src='" + options.imagePath + "ltL_ns.gif' alt=' | ' />",
			tagL_: "<img src='" + options.imagePath + "ltL_.gif' alt='   ' />",
			tagL_ne: "<img src='" + options.imagePath + "ltL_ne.gif' alt=' + ' />",
			tagL_nes: "<img src='" + options.imagePath + "ltL_nes.gif' alt=' + ' />",
			tagM_ne: "<img src='" + options.imagePath + "ltM_ne.gif' alt='[-]' class='" + options.classNames.expander + "'/>",
			tagM_nes: "<img src='" + options.imagePath + "ltM_nes.gif' alt='[-]' class='" + options.classNames.expander + "'/>",
			tagP_ne: "<img src='" + options.imagePath + "ltP_ne.gif' alt='[+]' class='" + options.classNames.expander + "'/>",
			tagP_nes: "<img src='" + options.imagePath + "ltP_nes.gif' alt='[+]' class='" + options.classNames.expander + "'/>",
			tagD_ne: "<img src='" + options.imagePath + "ltD_ne.gif' alt='[?]' class='" + options.classNames.expander + "'/>",
			tagD_nes: "<img src='" + options.imagePath + "ltD_nes.gif' alt='[?]' class='" + options.classNames.expander + "'/>",
//			tagCbSel: "<img src='" + options.imagePath + "cbChecked.gif' alt='[X]' class='" + options.classNames.checkbox + "'/>",
//			tagCbUnsel: "<img src='" + options.imagePath + "cbUnchecked.gif' alt='[ ]' class='" + options.classNames.checkbox + "'/>",
//			tagCbIntermediate: "<img src='" + options.imagePath + "cbIntermediate.gif' alt='[?]' class='" + options.classNames.checkbox + "'/>",
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

	_changeExpandList: function(key, bAdd, bWriteCookie) {
		// Add or remove key from expand-list.
		if( !key )
			return false;
		var n = this.expandedKeys.length;
		if( bAdd ) {
			if( $.inArray(key, this.expandedKeys) == -1 )
				this.expandedKeys.push(key);
		} else {
			this.expandedKeys = $.grep(this.expandedKeys, function(e){ return(e != key); });
		}
		if( bWriteCookie ) {
//			logMsg("_changeExpandList: write cookie: <%s> = '%s'", this.options.cookieId, this.expandedKeys.join(","));
			$.cookie(this.options.cookieId, this.expandedKeys.join(","));
		} else {
//			logMsg("_changeExpandList: %o", this.expandedKeys);
		}
		return ( n != this.expandedKeys.length );
	},

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
		this.tree.isInitializing = true;

		if( opts.children ) {
			// Read structure from node array
			root.append(opts.children);

		} else if( opts.initAjax && opts.initAjax.url ) {
			// Init tree from AJAX request
			root.appendAjax(opts.initAjax);

		} else if( opts.initId ) {
			// Init tree from another UL element
			this._createFromTag(root, $("#"+opts.initId));

		} else {
			// Init tree from the first UL element inside the container <div>
			var $ul = $this.find(">ul").hide();
			this._createFromTag(root, $ul);
			$ul.remove();
		}
		// bind event handlers
		this.bind();
		
		// We defined the first-time cookie from node.data, now store it
        if( this.tree.initCookie ) {
//			logMsg("Write cookie: <%s> = '%s'", opts.cookieId, this.tree.expandedKeys.join(","));
			$.cookie(opts.cookieId, this.tree.expandedKeys.join(","));
        }
        
        // Fire select events for all node that were initialized as 'selected'
		this.tree.isInitializing = false;
		for(var i=0; i<this.tree.initSelectedNodes.length; i++ ) {
			var dtnode = this.tree.initSelectedNodes[i];
//			logMsg("Select on init: %o", dtnode);
			dtnode.select(true);
		}
		// Activate node, that was initialized as 'active'
		if( this.tree.initActiveNode ) {
//			logMsg("Activate on init: %o", dtnode);
			this.tree.initActiveNode._activate();
		}
		
		// Focus, that was initialized as 'active'
		if( this.tree.initFocusNode ) {
			logMsg("Focus on init: %o", dtnode);
			this.tree.initFocusNode.focus();
		}
		
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
		logMsg("this.widgetBaseClass: %o", this.widgetBaseClass);
		logMsg("this.options: %o", this.options);
		logMsg("this.options.event: %o", this.options.event);
		
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
			
//			logMsg("bind(" + event.type + "): dtnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
			if( !dtnode )
				return false;
			// Handles keydown and keypressed, because IE and Safari don't fire keypress for cursor keys.
			// ...but Firefox does, so ignore them:
			if( event.type == "keypress" && event.charCode == 0 )
				return;
			switch(event.type) {
			case "click":
				return ( o.onClick && o.onClick(dtnode, event)===false ) ? false : dtnode.onClick(event);
			case "dblclick":
				return ( o.onDblClick && o.onDblClick(dtnode, event)===false ) ? false : dtnode.onDblClick(event);
			case "keydown":
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

	getSelectedNode: function() {
		return this.tree.getSelectedNode();
	},

	// --- Private methods
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

	// ------------------------------------------------------------------------
	lastentry: undefined
});


// The following methods return a value (thus breaking the jQuery call chain):

$.ui.dynatree.getter = "getTree getRoot getActiveNode getSelectedNodes";


// Plugin default options:

$.ui.dynatree.defaults = {
	title: "Dynatree root", // Name of the root node.
	rootVisible: false, // Set to true, to make the root node visible.
	rootCollapsible: false, // Prevent root node from being collapsed.
	imagePath: null, // Path to a folder containing icons. Defaults to 'skin/' subdirectory.
	children: null, // Init tree structure from this object array.
	initId: null, // Init tree structure from a <ul> element with this ID.
	initAjax: null, // Ajax options used to initialize the tree strucuture.
//	focusRoot: true, // Set focus to root node on init.
	keyboard: true, // Support keyboard navigation.
	autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
	expandOnAdd: false, // Automatically expand parent, when a child is added.
	clickFolderMode: 3, // 1:activate, 2:expand, 3:activate and expand
	selectionVisible: true, // Make sure, selected nodes are visible (expanded).
	checkbox: false, // Show checkbox
	selectMode: 2, // 1:single, 2:multi, 3:multi-hier
	// Low level event handlers (return false, to stop processing)
	onClick: null, // null: generate onSelect, ...
	onDblClick: null, // null: generate onFocus, ...
	onKeypress: null, // null: 
	onFocus: null, // Callback when a node receives focus.
	onBlur: null, // Callback when a node looses focus.
	// Pre-event handlers (return false, to stop processing)
	onQueryActivate: null, // Callback before a node is (de)activated.
	onQuerySelect: null, // Callback before a node is (de)selected.
	onQueryExpand: null, // Callback before a node is expanded/collpsed.
	// High level event handlers
	onActivate: null, // Callback when a node is activated.
	onDeactivate: null, // Callback when a node is deactivated.
	onSelect: null, // Callback when a node is selected.
	onUnselect: null, // Callback when a node is deselected.
	onExpand: null, // Callback when a node is expanded.
	onCollapse: null, // Callback when a node is expanded.
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
		expander: "ui-dynatree-expander",
		checkbox: "ui-dynatree-checkbox",
		nodeIcon: "ui-dynatree-icon",
		hidden: "ui-dynatree-hidden",
		disabled: "ui-dynatree-disabled",
		active: "ui-dynatree-active",
		selected: "ui-dynatree-selected",
		expanded: "ui-dynatree-expanded",
		folder: "ui-dynatree-folder",
		document: "ui-dynatree-document",
		focused: "ui-dynatree-focused",
		partsel: "ui-dynatree-partsel"
//		loading: "ui-dynatree-loading"
	},
	debugLevel: 0,
    persist: false, // Persist expand-status to a cookie
    cookieId: "ui-dynatree-cookie", // Choose a more unique name, to allow multiple trees.
/*
 	cookie: {
		expires: 7, //
		path: "/",
//		domain: "jquery.com",
//		secure: true
	},
*/
// 	minExpandLevel: 1, // Instead of rootCollapsible
//	expandLevel: 1, // Expand all branches until level i (set to 0 to )
//	fx: null, // Animations, e.g. { height: "toggle", opacity: "toggle", duration: 200 }

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
//	unselectable: false, // Initial selected status.
	// The following attributes are only valid if passed to some functions:
	children: null, // Array of child nodes.
	// NOTE: we can also add custom attributes here.
	// This may then also be used in the onSelect() or onLazyTree() callbacks.
	// ------------------------------------------------------------------------
	lastentry: undefined
};


// ---------------------------------------------------------------------------
})(jQuery);
