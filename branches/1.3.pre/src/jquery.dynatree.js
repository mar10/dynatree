/*************************************************************************
	jquery.dynatree.js
	Dynamic tree view control, with support for lazy loading of branches.

	Copyright (c) 2008-2012, Martin Wendt (http://wwWendt.de)
	Dual licensed under the MIT or GPL Version 2 licenses.
	http://code.google.com/p/dynatree/wiki/LicenseInfo

	A current version and some documentation is available at
		http://dynatree.googlecode.com/

	$Version:$
	$Revision:$

	@depends: jquery.js
	@depends: jquery.ui.core.js
	@depends: jquery.cookie.js
*************************************************************************/

/*jslint laxbreak: true, browser: true, indent: 0, white: false, onevar: false */


// Start of local namespace
(function($) {

var DEBUG = true;

function logDebug() {
	if(DEBUG){
		window.console && window.console.log && window.console.log.apply(arguments);		
	}
}
function logInfo() {
	window.console && window.console.info && window.console.info.apply(arguments);
}
function logWarning() {
	window.console && window.console.warn && window.console.warn.apply(arguments);
}


/*******************************************************************************
 *
 */
$.fn.myPlugin = function() {
	// Inside a plugin `this` is already a jQuery object
	var $this = this;

};

// -----------------------------------------------------------------------------
})(jQuery);
