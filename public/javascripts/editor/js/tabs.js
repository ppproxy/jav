
function Tabs(config){
	this.config = config;
	this.treeIdMap = {};
}

!function()
{
	var html = [
		'<div id="tabs" style="position: absolute;width:100%;height:100%">'
		, '  <ul>'
	    ,'  </ul>'
	   
	    ,'</div>'
	].join('\n');

	var index = 0

	var tab = [
	    '  <div id="tabs-1" class="tabs-panel" style="padding:0px">'
	    ,'  </div>'
	].join('\n');

	Tabs.prototype = new Component();
	Tabs.prototype.activeEditor = null;

	Tabs.prototype.active = function(id)
	{
		this.element.tabs( "option", "active", $('#'+id).index() - 1 );
		this.element.tabs( "refresh" );
	}

	Tabs.prototype.create = function(id, title, cmp)
	{
		var context = $(tab);
		var title = $('<li><a class="'+id+'" href="#'+id+'">'+title+'<a class="distroy-tab" tabId="'+id+'" >X</a></a></li>')
		var self = this;
		
		context.attr('id', id);
		cmp.render(context, true);
		this.element.find('ul').append(title)
		this.element.append(context);
		this.element.tabs( "refresh" );
		cmp.afterRender();

		title.find('.distroy-tab').click(function(){
			context.appendTo('<div></div>')
			title.appendTo('<div></div>')
			self.element.tabs( "refresh" );
			self.config.onClose && self.config.onClose(id)
		});


		this.element.tabs( "option", "active", $('.tabs-panel').length-1 );
		index ++;
	}


	Tabs.prototype.initElement = function(){
		this.element = $(html)
	}

	Tabs.prototype.afterRender = function(where)
	{
		this.tabs = this.element.tabs({
			load: function( event, ui ) {
				alert('hh')
			}
		})

	}
}();
