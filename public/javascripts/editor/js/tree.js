function Tree(config){
	this.config = config;
}


!function()
{
	var html = [
		'<div class="ztree" style="height:100%;margin:0px" id="code_tree">'
	].join('\n');

	Tree.prototype = new Component();

	Tree.prototype.initElement = function(){
		this.element = $(html)
	}
	
	Tree.prototype.afterRender = function(where)
	{
		var self = this;
		
		var setting = 
		{
			async: self.config.async
			, callback: 
			{
				onClick: function(event, treeId, treeNode)
				{
					if( !treeNode.isParent ){
						self.config.onClickLeaf && self.config.onClickLeaf(treeId, treeNode)
					}
				}
			}
		};
		
	    $.fn.zTree.init(this.element, setting, this.config.nodes);
	    
	}
}();