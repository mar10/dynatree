When updating from version 0.5 to 1.0, the following aspects have changed and may have to be adjusted.

**Main Changes:**
  * Built against jQuery 1.4 and jQuery UI 1.8
  * New HTML markup<br>Using <code>&lt;ul&gt;/&lt;li&gt;</code> for faster expand / collapse and smoother effects<br>
<ul><li>Support for drag'n'drop<br>Compatible with jquery.ui.draggable/.droppable but more efficient for a large number of nodes.<br>
</li><li>Modified css<br>ui-dynatree-document -> ui-dynatree-node<br>Class ui-dynatree-folder is now <i>additionally</i> set (together with ui-dynatree-node)<br>rename classes 'ui-dynatree-...' -> 'dynatree-...'</li></ul>


<b>Modified functions:</b>
<ul><li>All  callbacks have the Dynatree instance as 'this'<br>
</li><li>renamed node.reload() --> reloadChildren()<br>
</li><li>renamed dtnode -> node in the samples<br>
</li><li>Changed node.visit(fn, data, includeSelf) -> node.visit(fn, includeSelf)<br>visit() now returns nothing.<br>If the callback function returns false, the the traversal is stopped.<br>If the callback function returns 'skip', the the traversal of the current branch is stopped.<br>(Changes apply also for tree.visit())<br>
</li><li>hasChildren: return 'undefined' if node is unexpanded lazy, or only contains one status node<br>
</li><li>tree.reload(callback) -> new callback parameter<br>
</li><li>replaced node.append() -> node.addChild()</li></ul>


<b>New functions:</b>
<ul><li>node.activateSilent()<br>
</li><li>node.fromDict(dict)<br>
</li><li>node.getChildren(), getParent(), getPrevSibling(), getNextSibling()<br>
</li><li>node.getKeyPath(excludeSelf)<br>
</li><li>node.isChildOf(otherNode)<br>
</li><li>node.isDescendantOf(otherNode)<br>
</li><li>node.isFirstSibling()<br>
</li><li>node.isFocused()<br>
</li><li>node.isStatusNode()<br>
</li><li>node.move(targetNode, mode)<br>
</li><li>node.reloadChildren(callback)<br>
</li><li>node.scheduleAction()<br>
</li><li>node.setTitle(title)<br>
</li><li>node.sortChildren(cmp, deep)<br>
</li><li>node.visitParents(fn, includeSelf)<br>
</li><li>tree.disable(), .enable() (shortcut for $("#tree").dynatree("disable"))<br>
</li><li>tree.loadKeyPath()<br>
</li><li>tree.serializeArray()</li></ul>


<b>Other Changes:</b>
<ul><li>Distinguish for lazy nodes<br>childList == null: 'never loaded'<br>childList == <a href='.md'>.md</a>: 'loaded, but node has no children'<br>
</li><li>'noLink' option is available for nodes or the whole tree.<br>
</li><li>generateIds option to enable generation of <code>id</code> attribute (defaults to <code>false</code>)<br>
</li><li>Always hide root node.<br>Removed tree.rootVisible (now always hidden)<br>Removed tree.title.<br>
</li><li>tree.minExpandLevel must be >= 1<br>If a single visible root is wanted, one could always create one using<code>&lt;ul&gt;</code>Top level node expanders are not connected by vlines (requires additional expander icon).<br>If minExpandLevel>=1, also the expander icons are hidden, so the first icon column can be removed.<br>
</li><li>Load icon is now displayed in parent (not as sub node)<br>
</li><li>Added a new 'skin-vista'<br>
</li><li>node.appendAjax() triggers event 'nodeLoaded.dynatree.tree-id.node-key'<br>
</li><li>CSS ul.dynatree-container now uses <code>overflow: auto</code> by default<br>
</li><li>The functions<br><code>  var tree = $("#elem").dynatree("getTree");</code><br>and<br><code>  var node = $("#elem").dynatree("getRoot");</code><br>used to return <code>null</code>, when the tree was not initialized. Now they return an object.</li></ul>


<h3>Markup has changed</h3>

TODO: how to adjust CSS selectors for the new markup.<br>
<pre><code>    [...]<br>
</code></pre>