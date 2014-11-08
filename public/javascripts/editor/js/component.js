



function Component(){

}

Component.constructor = function(config){
	
	this.config = config;
}

Component.prototype.render = function(where, isRender)
{
	this.initElement();
	$(where).append(this.element);


	if( !isRender )
	this.afterRender(where);	
}

Component.prototype.afterRender = function(){

}
