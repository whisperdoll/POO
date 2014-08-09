function open(url, newTab)
{
	if (newTab === undefined)
		newTab = false;
		
	var win = window.open(url, (newTab ? "_blank", undefined));
	win.focus();
}