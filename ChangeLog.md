


#### Release 1.x ####

##### 1.2.7 (not yet released) #####

##### 1.2.6 / 2014-05-11 #####
  * Fixed [issue 471](https://code.google.com/p/dynatree/issues/detail?id=471): duplicate onQueryActivate(false) events
  * Fixed [issue 470](https://code.google.com/p/dynatree/issues/detail?id=470): Regression for [issue 263](https://code.google.com/p/dynatree/issues/detail?id=263) (IE9 overflow:auto causes container div to grow on hover)
  * Fixed [issue 487](https://code.google.com/p/dynatree/issues/detail?id=487): node.getKeyPath() always starts path with "/", regardless of tree.options.keyPathSeparator
  * Fixed [issue 478](https://code.google.com/p/dynatree/issues/detail?id=478): Unable to get property options of undefinied or null reference (regression of [r693](https://code.google.com/p/dynatree/source/detail?r=693))
  * Fixed [issue 473](https://code.google.com/p/dynatree/issues/detail?id=473): postProcess callback does not get called in initAjax
  * Fixed [issue 474](https://code.google.com/p/dynatree/issues/detail?id=474): Support mixing radio and checkbox nodes in same tree and toggling select state for both
  * Fixed [issue 458](https://code.google.com/p/dynatree/issues/detail?id=458): Drag and Drop helper does not show dragged item text when drag start from icon or left of it
  * Update to jQuery 1.10.2, jQuery-UI 1.9.2, jQuery Cookie 1.4.1
  * [details](http://code.google.com/p/dynatree/issues/list?can=1&q=Milestone%3ARelease1.2.6&colspec=Stars+ID+Type+Status+Modified+Priority+Milestone+Owner+Summary&x=status&y=milestone&mode=grid&cells=tiles)


##### 1.2.5 / 2013-11-19 #####
  * _BREAKING CHANGE_: [issue 379](https://code.google.com/p/dynatree/issues/detail?id=379): tree.toDict() has a new parameter ´includeRoot´ (defaults to false).<br>Use <code>tree.toDict(true)</code> to achieve the previous behavior.<br>
<ul><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=411'>issue 411</a>:  D'n'd for jQuery UI 1.10<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=420'>issue 420</a>:  Allow 0 as key<br>
</li><li><a href='http://code.google.com/p/dynatree/issues/list?can=1&q=Milestone%3ARelease1.2.5&colspec=Stars+ID+Type+Status+Modified+Priority+Milestone+Owner+Summary&x=status&y=milestone&mode=grid&cells=tiles'>details</a></li></ul>

<h5>1.2.4 / 2013-02-12</h5>

<ul><li>Fixes <a href='https://code.google.com/p/dynatree/issues/detail?id=402'>issue 402</a> (a regrression bug in removeChildren)<br>
</li><li><a href='http://code.google.com/p/dynatree/issues/list?can=1&q=Milestone%3ARelease1.2.4&colspec=Stars+ID+Type+Status+Modified+Priority+Milestone+Owner+Summary&x=status&y=milestone&mode=grid&cells=tiles'>details</a></li></ul>


<h5>1.2.3 / 2013-02-10</h5>

<ul><li>Fixes for jQuery 1.9<br>
</li><li><a href='http://code.google.com/p/dynatree/issues/list?can=1&q=Milestone%3ARelease1.2.3&colspec=Stars+ID+Type+Status+Modified+Priority+Milestone+Owner+Summary&x=status&y=milestone&mode=grid&cells=tiles'>details</a></li></ul>

<h5>1.2.2 / 2012-10-07</h5>
<b>Thanks to Ben Gillis for sponsoring this release!</b>

<ul><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=321'>issue 321</a>: Drag helper icons display offset is incorrect<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=332'>issue 332</a>: Drag and Drop Allowed when returning false<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=324'>issue 324</a>: Drag and drop example bug: onDragOver doesn't allow return "after"<br>
</li><li>Added a sample for RTL support<br>
</li><li>The (unsupported) context menu plugin that I used for the sample was patched to fix a positioning bug.<br>
</li><li>Using <a href='http://gruntjs.com/'>grunt</a> and <a href='https://github.com/mishoo/UglifyJS'>uglify</a> in the build process.<br>jquery.dynatree.min.js has been reduced to 80% of previous size.<br>This file is now found in the <code>/dist</code> folder<br>
</li><li>Dropped compliance with <a href='http://www.jslint.com/'>JSLint</a> in favor of <a href='http://www.jshint.com/'>JSHint</a>
</li><li>Updated to jQuery UI 1.8.24, jQuery 1.8.2</li></ul>


<h5>1.2.1 / 2012-06-16</h5>
<ul><li>Fixed a regression in <a href='https://code.google.com/p/dynatree/issues/detail?id=202'>issue 202</a>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=277'>issue 277</a>: loadKeyPath exception when key doesn't exist when parent has no children<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=278'>issue 278</a>: Clicking on the scroll bar in a scrollable tree (overflow: scroll) causes onDragStart<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=285'>issue 285</a>: Emptying Lazy Loaded Nodes Causes Reload / Duplicate Children<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=286'>issue 286</a>: Dropping a node over it's own child causes JS error (second DND example)<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=304'>issue 304</a>: feedback that the node is not found<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=313'>issue 313</a>: IE9 have problem with link focus<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=319'>issue 319</a>: Moving a newly added node fails if it has never been rendered<br>
</li><li>Fixed D'n'd is broken for jQuery 1.6.1 (<a href='https://code.google.com/p/dynatree/issues/detail?id=268'>issue 268</a>, regression of <a href='https://code.google.com/p/dynatree/issues/detail?id=211'>issue 211</a>)<br>
</li><li>Fixed IE9 overflow:auto causes container div to grow on hover (<a href='https://code.google.com/p/dynatree/issues/detail?id=263'>issue 263</a>)<br>
</li><li>Scrolling is enabled for drag'n'drop (requires CSS <code>overflow: scroll</code> on the container) (<a href='https://code.google.com/p/dynatree/issues/detail?id=244'>issue 244</a>)<br>
</li><li>Improved ASP.NET support to decode data.d JSON strings (<a href='https://code.google.com/p/dynatree/issues/detail?id=202'>issue 202</a>, credits to Joel Nelson)<br>
</li><li>New option <code>data.href</code> for JSON data (<a href='https://code.google.com/p/dynatree/issues/detail?id=241'>issue 241</a>)<br>
</li><li>New method <code>node.isLoading()</code> (<a href='https://code.google.com/p/dynatree/issues/detail?id=260'>issue 260</a>)<br>
</li><li>Fixed Ephemeral error on node.reloadChildren() in FF 7.0.1 (<a href='https://code.google.com/p/dynatree/issues/detail?id=231'>issue 231</a>)<br>
</li><li>Fixed Helper appears outside container during drag ('flashing') (<a href='https://code.google.com/p/dynatree/issues/detail?id=258'>issue 258</a>)<br>
</li><li>Fixed drag'n'drop for scrollable containers (<a href='https://code.google.com/p/dynatree/issues/detail?id=211'>issue 211</a>)<br>
</li><li>Fixed broken icons, when line-height > 1em (<a href='https://code.google.com/p/dynatree/issues/detail?id=237'>issue 237</a>)<br>
</li><li>Fixed $.dynatree.getNode() (<a href='https://code.google.com/p/dynatree/issues/detail?id=247'>issue 247</a>)<br>
</li><li>Fixed tooltip doesn't support the caracter ' (apostrophe) (<a href='https://code.google.com/p/dynatree/issues/detail?id=226'>issue 226</a>)<br>
</li><li>Deprecated getDtNodeFromElement() (use $.dynatree.getNode() instead)<br>
</li><li>Added sample for inline editing node titles.<br>
</li><li>Using dynatree for sample navigator.<br>
</li><li>Updated to jQuery 1.7.1, jQuery UI 1.8.17</li></ul>

<h5>1.2.0 / 2011-09-17</h5>
<ul><li>Pass additional error info to onPostInit() (<a href='https://code.google.com/p/dynatree/issues/detail?id=224'>issue 224</a>)<br>
</li><li>New node.onCreate() event to allow lazy binding (<a href='https://code.google.com/p/dynatree/issues/detail?id=210'>issue 210</a>)<br>
</li><li>Native support for ASP.NET 3.5 Ajax services (<a href='https://code.google.com/p/dynatree/issues/detail?id=202'>issue 202</a>)<br>
</li><li>Updated to jQuery 1.6.1<br><b>NOTE</b>: Starting with jQuery 1.6 we must use <code>.prop('dtnode')</code> instead of <code>.attr('dtnode')</code> to get the Dynatree node from an HTML element.<br>See <a href='https://code.google.com/p/dynatree/issues/detail?id=203'>issue 203</a> for details.<br>
</li><li>Support <code>&lt;a&gt;</code> tags (<a href='https://code.google.com/p/dynatree/issues/detail?id=138'>issue 138</a>)<br>
</li><li>Added node.isLazy()<br>
</li><li>New helper function <code>$.ui.dynatree.getNode(el)</code> returns a DynaTreeNode object for a given DOM element or jQuery object.<br>
</li><li>Fixed problem with partial selection initialization (<a href='https://code.google.com/p/dynatree/issues/detail?id=193'>issue 193</a>)<br>
</li><li>Fixed d'n'd sample (<a href='https://code.google.com/p/dynatree/issues/detail?id=185'>issue 185</a>)<br>
</li><li>Fixed <a href='https://code.google.com/p/dynatree/issues/detail?id=186'>issue 186</a>: Selecting parent selects unselectable children<br>
</li><li>Fixed dropping over a collapsed node<br>
</li><li>Removed some more debug messages.<br>
</li><li>Added sample on how to activate nodes according to URL.<br>
</li><li>Fixed context menu sample for jQuery 1.6 (<a href='https://code.google.com/p/dynatree/issues/detail?id=203'>issue 203</a>)</li></ul>

<h5>1.1.1 / 2011-03-01</h5>
<ul><li>Enable event bubbling in click events (<a href='https://code.google.com/p/dynatree/issues/detail?id=181'>issue 181</a>)<br>
</li><li>Sample that combines context menu with drag'n'drop (<a href='https://code.google.com/p/dynatree/issues/detail?id=174'>issue 174</a>).<br>
</li><li>Fixed sortChildren() on Safari (<a href='https://code.google.com/p/dynatree/issues/detail?id=180'>issue 180</a>)<br>
</li><li>Removed debug messages (<a href='https://code.google.com/p/dynatree/issues/detail?id=178'>issue 178</a>)<br>
</li><li>Fixed source pretty printing for IE.<br>
</li><li>Updated to jQuery 1.5.1</li></ul>

<h5>1.1.0 / 2011-01-23</h5>
<ul><li>Expander icon disappeared while lazy loading (<a href='https://code.google.com/p/dynatree/issues/detail?id=167'>issue 167</a>).<br>
</li><li>Allow empty lists when loading lazily (<a href='https://code.google.com/p/dynatree/issues/detail?id=168'>issue 168</a>).<br>
</li><li>New callback <code>tree.onRender(node, span)</code> allows changing or binding after HTML markup was created.<br>
</li><li>New callback <code>tree.onCustomRender(node)</code> allows passing custom HTML markup for node titles.<br>
</li><li>New method <code>tree.renderInvisibleNodes()</code> forces creation of all HTML elements.<br><code>node.render()</code> has new argument <i>includeInvisible</i>.<br>
</li><li>New methods <code>tree.count()</code> and <code>node.countChildren()</code>.<br>
</li><li>Updated to jQuery 1.4.4 / jQuery-UI 1.8.7</li></ul>

<h5>1.0.3 / 2010-12-12</h5>
<ul><li>Default skins now using CSS sprites (improved load time).<br>
</li><li>Simplified custom theming.<br>
</li><li>Checked with JSLint.<br>
</li><li>Some minor speed improvements (<a href='https://code.google.com/p/dynatree/issues/detail?id=159'>issue 159</a>)<br>
</li><li>Fixed layout for IE 6,7 (<a href='https://code.google.com/p/dynatree/issues/detail?id=166'>issue 166</a>).</li></ul>

<h5>1.0.2 / 2010-11-23</h5>
<ul><li>Fixed layout when not using strict mode (<a href='https://code.google.com/p/dynatree/issues/detail?id=165'>issue 165</a>).<br>
</li><li>Fixed lazy-loading empty nodes ('<a href='.md'>.md</a>') (<a href='https://code.google.com/p/dynatree/issues/detail?id=164'>issue 164</a>)</li></ul>

<h5>1.0.1 / 2010-11-20</h5>
<ul><li>Build against jQuery 1.4 and jQuery UI 1.8<br>
</li><li>Drag'n'drop support.<br>
</li><li>Improveded HTML markup.<br>
</li><li>And a lot more...<br>See <a href='UpdateToVersion10.md'>Migration hints</a> for details.</li></ul>


<h4>Release 0.5</h4>

<h5>0.5.5 / 2010-11-07</h5>
<ul><li>Updated jQuery Context Menu Plugin to version 1.01<br>
</li><li>Fixed drag'n'drop sample</li></ul>

<h5>0.5.4 / 2010-05-30</h5>
<ul><li>Dual licensed under the MIT or GPL Version 2 licenses (<a href='https://code.google.com/p/dynatree/issues/detail?id=144'>issue 144</a>)<br>
</li><li><a href='https://code.google.com/p/dynatree/issues/detail?id=140'>issue 140</a>
</li><li><a href='https://code.google.com/p/dynatree/issues/detail?id=141'>issue 141</a></li></ul>

<h5>0.5.3 / 2010-03-15</h5>
<ul><li><a href='https://code.google.com/p/dynatree/issues/detail?id=137'>issue 137</a>
</li><li>Improved Ajax error logging<br>
</li><li><a href='https://code.google.com/p/dynatree/issues/detail?id=135'>issue 135</a>
</li><li><a href='https://code.google.com/p/dynatree/issues/detail?id=133'>issue 133</a></li></ul>

<h5>0.5.2 / 2009-12-20</h5>
<ul><li>Added a drag and drop sample using standard plugins.<br>
</li><li>Improved the lazy load sample to use realistic Ajax calls with local files<br>
</li><li>Fixed persistence when reloading lazy nodes<br>
</li><li>Fixed the context menu sample (online includes had moved)<br>
</li><li>See also the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.5.2+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>fix list</a>.</li></ul>

<h5>0.5.1 / 2009-08-16</h5>
<ul><li>Support for reloading the tree or single lazy nodes.<br>
</li><li>Optionally inserting child nodes (instead of appending).<br>
</li><li>Optionally display radio buttons instead of checkboxes (credits to Lukasz Lakomy).<br>
</li><li>Options to hide checkboxes or make them unselectable.<br>
</li><li>See also the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.5.1+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>fix list</a>.</li></ul>

<h5>0.5.0 / 2009-07-15</h5>
<ul><li>Change how persistance and related events are working (no longer fires events)<br>
</li><li>Support for persistence with lazy trees<br>
</li><li>See also the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.5+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>fix list</a>.<br>
</li><li>See <a href='UpdateToVersion05.md'>Migration hints</a> for details.</li></ul>


<h4>Release 0.4</h4>

See <a href='UpdateToVersion04.md'>Migration hints</a> for details.<br>
<br>
<h5>0.4.2 / 2009-04-18</h5>
<ul><li>Added support for callbacks after lazy loading.<br>
</li><li>Fixed a persistence bug.<br>
</li><li>Implemented cut/copy/paste in the context menu example.<br>
</li><li>See the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.4.2+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>fix list</a>.</li></ul>

<h5>0.4.1 / 2009-03-23</h5>
<ul><li>See the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.4.1+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>fix list</a>.</li></ul>

<h5>0.4.0 / 2009-03-12</h5>
<ul><li>Minor fixes</li></ul>

<h5>0.4 rc-1</h5>

<ul><li>node.toDict() has a calbback function, for example to convert the keys, ..<br>
</li><li>'view-source:' link on sample pages<br>
</li><li>dropped <i>bDebug; logMsg() now logs unconditionally. Use tree.logDebug() instead.<br>
</li><li>Cookie path configurable<br>
</li><li>Optimized loading time of large trees.<br>
</li><li>New functions node.expand(flag) and tree.visit(callback)<br>
</li><li>New css classes ui-dynatree-exp-c and ui-dynatree-ico-cf so we don't have to use mutliple class names in CSS (doesn't work with IE6)<br>
</li><li>Implemented onExpand callback</li></ul></i>

<h5>0.4 beta-2</h5>

<ul><li>Adding a node (e.g. by lazy read) now sets the multi-hier selection status correctly<br>
</li><li>New parameter for tree.getSelectedNodes(stopOnParents)<br>
</li><li>minExpandLevel > 1 now forces expansion when initializing<br>
</li><li>Clear container div on create, so we can put 'ERROR: need JavaScript' here<br>
</li><li>Updated to jQuery 1.3.1<br>
</li><li>Downgraded to jQuery UI 1.5.3 (1.6 is not yet released)<br>
</li><li>Example Browser</li></ul>

<h5>Main changes</h5>

<ul><li>'selected'/'select' was renamed to 'active'/'activate'<br>This is more precise and allowed implementation of the new selection feature.<br>
</li><li>Selection support<br>Avable  mode: single selection, multi selection and multi-hierarchical.<br>
</li><li>Support for checkboxes<br>
</li><li>Changed syntax when initializing from a UL tag.<br>Most status information can now be passed in the <code>class</code> attribute, e.g <code>class='expanded selected focused active lazy folder'</code>.<br>The <code>data</code> attribute is not valid in strict html and may be avoided most of the time. It is still supported however, and may be used to attach additional custom data to the nodes.<br>
</li><li>Persistence was extended to active, focus, expand and selection status.<br>Also, it is no longer required define node-keys, because dummy keys are generated by default.<br>
</li><li>New API functions like <code>$("#tree").disable()</code>, <code>tree.visit()</code>, ...<br>
</li><li>New callbacks like <code>onClick(dtnode, event)</code>, <code>onQueryActivate(activate, dtnode)</code>, and <code>onActivate(dtnode)</code>.<br>
</li><li>The tree images are now defined in CSS, instead of image name options.<br>
</li><li>New <code>fx</code> option for animation effects when expanding/collapsing.<br>
</li><li>New node option 'data.addClass' to addcustom class names to nodes.<br>
</li><li>See the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.4+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>Release 0.4 fixlist</a> for details.</li></ul>

<h4>Release 0.3</h4>

<h5>0.3.1 (currently in the SVN manintenance branch only)</h5>
<ul><li>Fixes: <a href='https://code.google.com/p/dynatree/issues/detail?id=#64'>issue #64</a></li></ul>

<h5>0.3.0 / 2008-12-07</h5>
<ul><li>Changes: selectExpandsFolders is deprecated. Use clickFolderMode instead.<br>
</li><li>Enhancements: <a href='https://code.google.com/p/dynatree/issues/detail?id=#5'>issue #5</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#57'>issue #57</a></li></ul>

<h5>0.3 RC2</h5>
<ul><li>Fixes: <a href='https://code.google.com/p/dynatree/issues/detail?id=#52'>issue #52</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#55'>issue #55</a>
</li><li>Enhancements: <a href='https://code.google.com/p/dynatree/issues/detail?id=#21'>issue #21</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#22'>issue #22</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#45'>issue #45</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#58'>issue #58</a></li></ul>

<h5>0.3 RC1</h5>
<ul><li>Fixes: <a href='https://code.google.com/p/dynatree/issues/detail?id=#41'>issue #41</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#42'>issue #42</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#46'>issue #46</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#51'>issue #51</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#50'>issue #50</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#48'>issue #48</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#47'>issue #47</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#43'>issue #43</a>
</li><li>Enhancements: <a href='https://code.google.com/p/dynatree/issues/detail?id=#40'>issue #40</a>, <a href='https://code.google.com/p/dynatree/issues/detail?id=#5'>issue #5</a> (experimental)</li></ul>

<h5>Main changes</h5>

<ul><li>jQuery plugin style: $(..).dynatree()<br>
</li><li>Keyboard navigation<br>
</li><li>Improved documentation<br>
</li><li>Hosted on a public platform<br>
</li><li>See the <a href='http://code.google.com/p/dynatree/issues/list?can=1&q=milestone:Release0.3+status%3AFixed%2CVerified&sort=-modified&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'>Release 0.3 fixlist</a> for details.</li></ul>


<h5>Updating from a previous release</h5>
This is the first jQuery based release, so there is no update path.<br>
<br>
<h4>0.2 and before</h4>
Dynatree is based on <a href='http://wwWendt.de/tech/lazytree'>lazytree 0.2</a>.<br>
I had to rename it, because there already was a jQuery plugin named <i>lazytree</i>.