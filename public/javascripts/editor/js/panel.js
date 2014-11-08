function Panel(config){
	this.config = config;
}

!function()
{
	var html = [
		'<div style="height:100%;width:100%">'
		, '<div class="ui-layout-center"></div>'
		, '<div class="ui-layout-north"style="padding:0px"></div>'
		, '<div class="ui-layout-south style="padding:0px""></div>'
		, '<div class="ui-layout-west" style="padding:0px"></div>'
		, '</div>'
	].join('\n');

	Panel.prototype = new Component();

	Panel.prototype.initElement = function()
	{
		this.element = $(html);

		if( this.config.north && this.config.north.render )
			this.config.north.render(this.element.find('.ui-layout-north'), true);
		else if (this.config.north)
			this.element.find('.ui-layout-north').append(this.config.north)



		if( this.config.south && this.config.south.render )
			this.config.south.render(this.element.find('.ui-layout-south'), true);

		if( this.config.west  && this.config.west.render )
			this.config.west.render(this.element.find('.ui-layout-west'), true);

		if( this.config.center && this.config.center.render )
			this.config.center.render(this.element.find('.ui-layout-center'), true);



	}

	Panel.prototype.afterRender = function(where)
	{

		 $(this.element).layout({
	        closable:                   true    // pane can open & close
	        , resizable:                  true    // when open, pane can be resized 
	        , slidable:                   true    // when closed, pane can 'slide' open over other panes - closes on mouse-out
	        , livePaneResizing:           true
	        ,  west__size:         .15
	        ,  south__initClosed:  true
	    });

		if( this.config.north && this.config.north.render )
			this.config.north.afterRender() //(this.element.find('.ui-layout-north'), true);

		if( this.config.south && this.config.south.render )
			this.config.south.afterRender() //(this.element.find('.ui-layout-south'), true);

		if( this.config.west && this.config.west.render )
			this.config.west.afterRender()  //(this.element.find('.ui-layout-west'), true);
	
		if( this.config.center && this.config.center.render )
			this.config.center.afterRender()  //(this.element.find('.ui-layout-west'), true);
	
	}

}();