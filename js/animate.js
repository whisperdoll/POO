function animateClick(trigger, animation)
{
	var element = $(trigger);
	trigger = $(trigger);
	trigger.click(function()
	{
		element.addClass('animated ' + animation);          
		
		window.setTimeout(function()
		{
			element.removeClass('animated ' + animation);
		}, 2000);
	});
}

function animateHover(trigger, animation)
{
	var element = $(trigger);
	trigger = $(trigger);
	
	trigger.hover(function()
	{
		element.toggleClass("animated " + animation);
	});
}