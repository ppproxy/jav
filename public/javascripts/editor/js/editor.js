
function Editor(config){
	this.config = config;
}

!function()
{
	var html = [
		'<div  class="editor"></div>'
	].join('\n');


	Editor.prototype = new Component();

	var index = 0

	Editor.prototype.initElement = function(){
		this.element = $(html)
		this.element.attr('id', this.config.id)
	}

	Editor.prototype.setValue = function(value){
        var self = this;
        this.editor.setValue(value )
        setTimeout(function(){
			self.element.find('.ace_scrollbar-v').scrollTop(0) ;
        }, 40);
	}

	Editor.prototype.afterRender = function(where)
	{

        var editor = ace.edit(this.config.id);
        editor.setFontSize("20px")
        editor.setTheme("ace/theme/twilight");
        
        var JavaScriptMode = require("ace/mode/javascript").Mode;
        editor.getSession().setMode(new JavaScriptMode());
		this.editor = editor;
		
		var self = this;

	}
}();
