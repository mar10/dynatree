/*************************************************************************
	jquery.jsconsole.js
	Convert a div tag in to a log window.

	Copyright (c) 2012, Martin Wendt (http://wwWendt.de)
	Dual licensed under the MIT or GPL Version 2 licenses.
	http://code.google.com/p/dynatree/wiki/LicenseInfo

	A current version and some documentation is available at
		http://dynatree.googlecode.com/

	${Version}
	${Revision}

	@depends: jquery.js
*************************************************************************/

/*jslint laxbreak: true, browser: true, indent: 0, white: false, onevar: false */


// Start of local namespace
(function($) {

/*******************************************************************************
 *
 */
	var methods = {
		init: function(options) {
			// Create some defaults, extending them with any options that were provided
			var settings = $.extend( {
				"location": "top",
				"background-color" : "blue"
			}, options);
			return this.each(function(){
//				$(window).bind("keydown.jsconsole", methods._keydown);
				var $this = $(this),
				    data = $this.data("jsconsole");
				// If the plugin hasn't been initialized yet
				if ( ! data ) {
					$(this).data("jsconsole", {
						count: 0,
						minLevel: 0
					});
				}
			});
		},
		destroy : function( ) {
			return this.each(function(){
				$(window).unbind(".jsconsole");
				$(this).removeData("jsconsole");
			})
		},
		_append: function(level, cls, msg) {
			var $this = $(this),
				data = $this.data("jsconsole");
			if(level >= data.minLevel){
				data.count += 1;
				$("<div/>", {
					text: "#" + data.count + ": " + msg,
					"class": "logEntry " + cls
				}).appendTo($this);
			}
		},
		debug: function(msg) {
//			methods._append.apply(this, Array.prototype.slice.call( arguments, 1 ));
			methods._append.call(this, 0, "debug", msg);
		},
		info: function(msg) { 
			methods._append.call(this, 1, "info", msg);
		},
		warn: function(msg) { 
			methods._append.call(this, 2, "warn", msg);
		},
		error: function(msg) { 
			methods._append.call(this, 3, "error", msg);
		}
	};

	$.fn.jsconsole = function( method ) {
		var $this = this;
		if ( methods[method] ) {
			return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof method === "object" || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error("Method " +  method + " does not exist on jQuery.jsconsole");
		}    
	};

// -----------------------------------------------------------------------------
})(jQuery);
