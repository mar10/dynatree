/*************************************************************************
	(c) 2008-2009 Martin Wendt
 *************************************************************************/

function viewSourceCode()
{
	window.location = "view-source:" + window.location.href;
	
}

function initCodeSamples() {
	$('a.codeExample').each (
			function( i ) {
				$( this ).after( '<pre class="codeExample prettyprint"><code></code></pre>' );
			}
	)
	$( 'pre.codeExample' ).hide();
	$('a.codeExample').toggle( 
			function() {
				if( !this.old ){
					this.old = $(this).html();
				}
				$(this).html('Hide Code');
				parseCode(this);
			},
			function() {
				$(this).html(this.old);
				$(this.nextSibling).hide();
			}
	)
	function parseCode(o){
		if(!o.nextSibling.hascode){
			$.get (o.href, function(code){
				// Doesn't work (only accepts simple/restricted html strings, not a full html page):
//				logMsg("code.html: %o", $(code).html());

				// Remove <!-- Start_Exclude [...] End_Exclude --> blocks:
				code = code.replace(/<!-- Start_Exclude(.|\n|\r)*?End_Exclude -->/gi, "<!-- (Irrelevant source removed.) -->");

/*
				code = code.replace(/&/mg,'&#38;')
					.replace(/</mg,'&#60;')
					.replace(/>/mg,'&#62;')
					.replace(/\"/mg,'&#34;')
					.replace(/\t/g,'  ')
					.replace(/\r?\n/g,'<br>')
					.replace(/<br><br>/g,'<br>');
					.replace(/ /g,'&nbsp;');
*/
				// Reduce tabs from 8 to 2 characters
				code = code.replace(/\t/g, "  ");
				$("code", o.nextSibling).text(code);
				o.nextSibling.hascode = true;
				// Format code samples
				try {
					prettyPrint();
				} catch (e) { }
			});
		}
		$(o.nextSibling).show();
	}
}



$(function(){
	// Log to Google Analytics, when not running locally
	if ( document._gat && document.URL.toLowerCase().indexOf('wwwendt.de/')>=0 ) {
		var pageTracker = _gat._getTracker("UA-316028-1");
		pageTracker._trackPageview();
	}

	// Show some elements only, if (not) inside the Example Browser
	if (top.location == self.location) 
		$(".hideOutsideFS").hide();
	else
		$(".hideInsideFS").hide();
	
	initCodeSamples();
});
