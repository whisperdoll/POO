function pmSystem()
{
	this.container = document.createElement("div");
	this.container.className = "pmSystemContainer";
	this.pms = {};
}

pmSystem.prototype.add = function(id)
{
	var n = new pmChild(this, id);
	this.pms[id] = n;
	$(this.container).append(n.container);
}

function pmChild(parent, id)
{
	var my = this;
	this.parent = parent;
	this.id = id;
	this.hidden = false;
	
	this.container = new classElement("div", "pmContainer");
	this.header = new classElement("div", "pmHeader");
	this.chat = new classElement("div", "pmChat");
	this.input = new classElement("input", "pmInput");
	this.send = new classElement("button", "pmSend");
	this.hide = new classElement("div", "pmHide glyphicon glyphicon-minus");
	this.close = new classElement("div", "pmClose glyphicon glyphicon-remove");
	
	var c = $(this.container);
	
	c.append(this.chat);
	c.append(this.input);
	c.append(this.send);
	c.append(this.header);
	c.append(this.hide);
	c.append(this.close);
	
	$(this.hide).click(function() // dirty af
	{
		//my.container.style.height = (my.hidden ? "100%" : "32px");
		my.container.style.top = (my.hidden ? "0px" : "264px");
		my.hidden = !my.hidden;
	});
	
	$(this.close).click(function()
	{
		delete my.parent.pms[my.id];
		my.container.remove();
	});
	
	this.send.innerHTML = "Send";
	
	this.header.innerHTML = escapeHTML(this.name());
	
	$(this.send).click(function()
	{
		my.sendLine();
	});
	
	$(this.input).keypress(function(e)
	{
		if (e.which === 13)
		{
			my.sendLine();
		}
	});
}

pmChild.prototype.name = function()
{
	return playerName(this.id);
};

pmChild.prototype.sendLine = function()
{
	if (this.input.value)
	{
		var toSend = this.input.value;
		this.input.value = "";
		
		var data = { "to": this.id, "message": toSend };
		relay.send("pm", data);
		
		this.printMine(toSend);
	}
};

pmChild.prototype.print = function(message)
{
	var d = document.createElement("div");
	d.innerHTML = timestamp() + " <b>" + this.name() + "</b>: " + escapeHTML(message);
	
	$(this.chat).append(d);
};

pmChild.prototype.printMine = function(message)
{
	var d = document.createElement("div");
	d.innerHTML = timestamp() + " <b>" + playerName(myInfo.id) + "</b>: " + escapeHTML(message);
	
	$(this.chat).append(d);
};