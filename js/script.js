var relay;
var cache = {};
var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];

var myInfo = {};
var myChannels = [];
var allChannels = {};
var allPlayers = {};
var channelPlayers = {};
var currentChannel = -1;

var messageHandlers =
{
	"defaultserver": function(data)
	{
		$("#input_connection").get(0).value = data;
		relay.send("registry");
	},
	"servers": function(data)
	{
		var servers = JSON.parse(data);
		var serverList = $("#serverList");
		var allServers = {};
		
		$($("#serverList").find("*")).fadeOut(300, function()
		{
			serverList.get(0).innerHTML = "";
			
			for (var i = 0; i < servers.length; i++)
			{
				var server = servers[i];
				
				// description, ip, name, locked, num, port
				
				allServers[server.name] = server;
			}
			
			var listed = [];
			
			for (var server in allServers)
			{
				if (allServers.hasOwnProperty(server))
				{
					if (listed.length === 0)
					{
						listed.push(allServers[server]);
					}
					else
					{
						var pushed = false;
						
						for (var i = 0; i < listed.length; i++)
						{
							if (listed[i].num < allServers[server].num)
							{
								listed.insert(i, allServers[server]);
								pushed = true;
								break;
							}
						}
						
						if (!pushed)
						{
							listed.push(allServers[server]);
						}
					}
				}
			}
			
			for (var i = 0; i < listed.length; i++)
			{
				var server = listed[i];
				var div = document.createElement("div");
				div.className = "serverItem animated fadeIn";
				div.id = "serverItem" + i;
				div.innerHTML = escapeHTML(server.name) + "<span style='float:right; color:inherit;'>" + server.num + (server.hasOwnProperty("max") ? "/" + server.max : "") + " user(s) online</span>";
				div.server = server;
				
				$(div).click(function()
				{
					var m_server = this.server;
					$("#serverDescription").get(0).innerHTML = m_server.description;
					$("#input_connection").get(0).value = m_server.name + " - " + m_server.ip + ":" + m_server.port;
					
					if (cache.serverItemFocused)
					{
						$(cache.serverItemFocused).removeClass("serverItem-focused");
					}
					
					$(this).addClass("serverItem-focused");
					
					cache.serverItemFocused = this;
				});
					
				serverList.append(div);
			}
		});
	},
	"connected": function(data)
	{
		$("#page-server-content").fadeOut(500, function()
		{
			$("#page-server").fadeOut(2000, function()
			{
				$("#page-client").fadeIn(500, function()
				{
					var login = { version: 1 };
					login.default = getVal("defaultChannel", "Tohjo Falls");
					login.autojoin = getVal("autojoinChannels", []);
					login.ladder = getVal("ladderEnabled", true);
					login.idle = getVal("idle", false);
					login.color = myInfo.color;
					login.name = myInfo.name;
					
					relay.send("login", login);
				});
			});
		});
	},
	"challenge": function(data)
	{
		var genHash = function(pass, salt)
		{
			return md5(md5(pass) + salt);
		};
		
		var modal = document.createElement("div");
		modal.className = "modal fade";
		modal.tabindex = "-1";
		modal.role = "dialog";
		modal["aria-hidden"] = true; // use setProperty instead of brackets for firefox
		
		modal.innerHTML = "<div class='modal-dialog'><div class='modal-content'><div class='modal-header'><h4 class='modal-title'>Login</h4></div><div class='modal-body'>That name is registered. If you don't know the password for that name, then refresh the page and pick a different name.<br /><br />Input password:<br /><input type='password' class='form-control' id='input_password'></div><div class='modal-footer'><button type='button' class='btn btn-primary' id='btn_login'>Login &raquo;</button></div></div></div>";
		
		$("body").append(modal);
		
		$(modal).modal(
		{
			backdrop: "static",
			keyboard: false
		});
		
		$("#btn_login").click(function(e)
		{			
			var pass = $("#input_password").get(0).value;
			
			if (pass)
			{
				$(modal).modal("hide");
				relay.send("auth", { "hash": genHash(pass, data) });
			}
			
			e.preventDefault();
		});
	},
	"login": function(data)
	{
		myInfo = JSON.parse(data);
	},
	"channels": function(data)
	{
		data = JSON.parse(data);
		
		allChannels = data;
		createChannelsFromJSON(data);
	},
	"newchannel": function(data)
	{
		data = JSON.parse(data);
		
		allChannels[data.id] = data.name;
		createChannelFromJSON(data);
	},
	"removechannel": function(data)
	{
		delete allChannels[data];
		
		deleteChannel(data);
	},
	"chat": function(data)
	{
		data = JSON.parse(data);
		var ts = timestamp();
		data.message = data.message.replace(/\<timestamp([^\>]+|)\>(\s?)/gi, ts + " ");
		
		if (data.message.contains(": ") && !data.html)
		{
			var name = data.message.split(": ")[0];
			var message = data.message.substr(data.message.indexOf(": ") + 2);
			var toPrint = "";
			
			if (name === "Welcome Message")
			{
				toPrint = "<span class='chat-welcome'>%1 <b>%2:</b></span> %3".args(ts, name, message);
			}
			else if (name === "~~Server~~")
			{
				toPrint = "<span class='chat-server'>%1 <b>%2:</b></span> %3".args(ts, name, message);
			}
			else if (playerId(name) === -1)
			{
				toPrint = "<span class='chat-script'>%1 <b>%2:</b></span> %3".args(ts, name, message);
			}
			else
			{
				toPrint = "<span class='chat-player' style='color:%4;'>%1 <b>%2:</b></span> %3".args(ts, name, message, playerByName(name).color);
			}
			
			print(toPrint, data.channel);
		}
		else
		{
			var before = "";
			var after = "";
			var before2 = "";
			var after2 = "";
			
			if (data.message.startsWith("***"))
			{
				before = "<span class='chat-action'>";
				after = "</span>";
				before2 = "<b>";
				after2 = "</b>";
			}
			else if (data.message.startsWith("\u00BB\u00BB\u00BB"))
			{
				before = "<span class='chat-border'>";
				after = "</span>";
				before2 = "<b>";
				after2 = "</b>";
			}
			
			print(before + (data.html ? data.message : (data.message === "" ? "" : ts + " " + before2 + escapeHTML(data.message) + after2)) + after, data.channel);
		}
	},
	"channelplayers": function(data)
	{
		data = JSON.parse(data);
		
		if (myChannels.contains(data.channel))
		{
			addChannelPlayersFromJSON(data);
		}
		
		channelPlayers[data.channel] = data.players;
	},
	"join": function(data)
	{
		var channel = data.split("|")[0];
		var user = data.split("|")[1];
		
		if (user == myInfo.id)
		{
			myChannels.push(channel);
			makeJoinedChannel(channel);
			
			if (channelPlayers.hasOwnProperty(channel))
			{
				addChannelPlayersFromJSON({ "channel": channel, "players": channelPlayers[channel] });
			}
		}
		
		addChannelPlayer(channel, user);
		
		channelPlayers[channel].push(user);
	},
	"leave": function(data)
	{
		var channel = data.split("|")[0];
		var user = data.split("|")[1];
		
		if (user == myInfo.id)
		{
			removeChannel(channel);
		}
		
		removeChannelPlayer(channel, user);
	},
	"players": function(data)
	{
		var updates = JSON.parse(data);
		var first = allPlayers === {};
		
		for (var x in updates)
		{
			if (updates.hasOwnProperty(x))
			{
				allPlayers[x] = updates[x];
				
				if (!allPlayers[x].color)
				{
					allPlayers[x].color = namecolorlist[parseInt(x) % namecolorlist.length];
				}
				
				var items = $(".channel-player-item-" + x);
			}
		}
		
		if (first)
		{
			for (var i = 0; i < myChannels.length; i++)
			{
				addChannelPlayer(myChannels[i], myInfo.id);
			}
		}
	}
};

function connectToRegistry()
{
	relay = new Relay("server.pokemon-online.eu:10508", handleOpen, handleMessage, handleClose, handleError);
}

function connectToServer()
{
	myInfo.name = $("#input_name").get(0).value;
	myInfo.color = $("#input_color").get(0).value;
	
	var ip = $("#input_connection").get(0).value;
	ip = (ip.contains(" - ") ? ip.substr(ip.lastIndexOf(" - ") + 3) : ip);
	
	relay.send("connect", ip);
}

function handleMessage(msg)
{
	var received = msg.data.toString();
	console.log("received: " + received);
	var command = received.split("|")[0];
	var data = (received.contains("|") ? received.substr(received.indexOf("|") + 1) : undefined);
	
	if (messageHandlers.hasOwnProperty(command))
		messageHandlers[command](data);
}

function handleOpen(data)
{
	console.log("opened");
}

function handleClose(data)
{
	console.log("closed");
	
	malert("Connection closed", "The connection to the server has been closed. Refresh the page.");
}

function handleError(data)
{

}

function print(text, channel)
{
	if (channel == -1)
	{
		for (var i = 0; i < myChannels.length; i++)
		{
			print(text, myChannels[i]);
		}
	}
	else
	{
		var c = $("#channel-chat-chat-" + channel).get(0);
		c.innerHTML += "<span class='printed-message'>" + text + "</span><br />";
		
		scrollToBottom(c);
		
		if (channel != currentChannel && !$("#channel-selector-" + channel).hasClass("channel-selector-notify"))
		{
			$("#channel-selector-" + channel).addClass("channel-selector-notify");
			updateNotify();
		}
	}
}

function updateNotify()
{
	$("#channel-notify").get(0).innerHTML = $(".channel-selector-notify").length;
}

function addChannelPlayer(channel, player)
{
	// player is id
	
	if (!myChannels.contains(channel) || !allPlayers.hasOwnProperty(player))
	{
		return;
	}
	
	var item = new ChannelPlayerItem(channel, player);
	
	var name = playerName(player);
	
	var names = [];
	var	cp = channelPlayers[channel];
	
	for (var i = 0; i < cp.length; i++)
	{
		names.push(playerName(cp[i]));
	}
	
	names.push(name);
	names.alphabetize();
	
	var index = names.indexOf(name);
	var list = $("#channel-chat-players-" + channel);
	
	if (index === 0)
	{
		list.prepend(item);
	}
	else
	{
		$("#channel-" + channel + "-player-item-" + playerId(names[index - 1])).after(item);
	}
	
	if (getVal("playerEvents_channel", true) && getVal("playerEvents_channel_" + channelName(channel), true))
	{
		print(playerName(player) + " joined the channel.", channel);
	}
}

function addChannelPlayersFromJSON(players)
{
	var c = players.channel;
	var p = players.players; // array of ids
	
	var names = [];
	
	for (var i = 0; i < p.length; i++)
	{
		names.push(playerName(p[i]));
	}
	
	names.alphabetize();
	var list = $("#channel-chat-players-" + c);
	
	for (var i = 0; i < names.length; i++)
	{
		var e = new ChannelPlayerItem(c, playerId(names[i]));
		list.append(e);
	}
}

function removeChannelPlayer(channel, player)
{
	// player is id
	
	$("#channel-" + channel + "-player-item-" + player).get(0).delete();
	
	if (getVal("playerEvents_channel", true) && getVal("playerEvents_channel_" + channelName(channel), true))
	{
		print(playerName(player) + " left the channel.", channel);
	}
}

function ChannelPlayerItem(channel, id)
{
	var player = allPlayers[id];
	
	var ret = document.createElement("li");
	ret.className = "channel-player-item";
	ret.id = "channel-" + channel + "-player-item-" + id;
	
	var span = document.createElement("span");
	span.style.color = player.color;
	span.style.setProperty("font-weight", "bold");
	span.innerHTML = escapeHTML(player.name);
	
	$(ret).append(span);
	
	return ret;
}

function createChannelFromJSON(channel)
{
	// json object name and id
	var names = valuesOf(allChannels);
	names.push(channel.name);
	names.alphabetize();
	var index = names.indexOf(channel.name);
	
	var item = new ChannelItem(channel.name, channel.id);
	
	if (index === 0)
	{
		$("#channel-list").prepend(item);
	}
	else
	{
		$(".channel-item #channel-item-" + channelId(names[index - 1])).after(item);
	}
}

function createChannelsFromJSON(channels)
{
	// json list id:name
	
	var citems = [];
	
	for (var channel in channels)
	{
		if (channels.hasOwnProperty(channel))
		{
			citems.push(new ChannelItem(channels[channel], channel));
		}
	}
	
	citems.sort(function(a, b)
	{
		return a.channelName.toLowerCase().localeCompare(b.channelName.toLowerCase());
	});
	
	var list = $("#channel-list");
	
	for (var i = 0; i < citems.length; i++)
	{
		list.append(citems[i]);
	}
}

function deleteChannel(id)
{
	if (myChannels.hasOwnProperty(id))
	{
		leaveChannel(id);
	}
	
	if (allChannels.hasOwnProperty(id))
	{
		delete allChannels[id];
	}
	
	$("#channel-list-item-" + id).get(0).delete();
	updateNotify();
}

function leaveChannel(id)
{
	relay.send("leave", id);
}

function removeChannel(id)
{
	if (myChannels.contains(id))
	{
		myChannels.remove(id);
	}
	
	var switchAfter = currentChannel == id;
	
	$("#channel-selector-" + id).get(0).delete();
	$("#channel-chat-" + id).get(0).delete();
	
	if (switchAfter)
	{
		var switchTo = $("#mainPane .channel-chat").get(0);
		$(switchTo).addClass(".active-channel");
		$(switchTo).show();
	}
	
	updateNotify();
}

function ChannelItem(name, id)
{
	var ret = document.createElement("li");
	ret.className = "channel-list-item";
	ret.id = "channel-list-item-" + id;
	ret.channelName = name;
	ret.channelId = id;
	ret.innerHTML = escapeHTML(name);
	
	$(ret).click(function()
	{
		switchToChannel(this.channelId);
	});
	
	return ret;
}

function channelId(name)
{
	return _.invert(allChannels)[name];
}

function channelName(id)
{
	return allChannels[id];
}

function playerId(name)
{
	for (var player in allPlayers)
	{
		if (allPlayers.hasOwnProperty(player))
		{
			if (cmp(allPlayers[player].name, name))
				return player;
		}
	}
	
	return -1;
}

function playerName(id)
{
	return allPlayers[id].name;
}

function playerByName(name)
{
	return allPlayers[playerId(name)];
}

function switchToChannel(id)
{
	if (myChannels.contains(id))
	{
		$("#channel-chat-" + currentChannel).hide();
		$("#channel-chat-" + currentChannel).removeClass("active-channel");
		
		var c = $("#channel-chat-" + id);
		c.addClass("active-channel");
		c.show();
		
		$("#channel-name").get(0).innerHTML = escapeHTML(channelName(id));
		if ($("#channel-selector-" + id).hasClass("channel-selector-notify"))
		{
			$("#channel-selector-" + id).removeClass("channel-selector-notify");
		}
		
		currentChannel = id;
	}
	else
	{
		joinChannel(channelName(id));
	}
	
	updateNotify();
}

function joinChannel(name)
{
	relay.send("join", name);
}

function makeJoinedChannel(id)
{
	$("#channel-selector-container").append(new ChannelSelectorItem(id));
	$("#mainPane").append(new ChannelChatItem(id));
	
	switchToChannel(id);
}

function ChannelSelectorItem(id)
{
	var name = channelName(id);
	
	var ret = document.createElement("li");
	ret.className = "channel-selector";
	ret.id = "channel-selector-" + id;
	ret.channelId = id;
	ret.channelName = name;
	
	var nameItem = document.createElement("span");
	nameItem.className = "h4";
	nameItem.innerHTML = escapeHTML(name);
	
	var closeItem = document.createElement("span");
	closeItem.className = "glyphicon glyphicon-remove right-aligned channel-selector-remove";
	closeItem.channelId = id;
	
	$(ret).append(nameItem);
	$(ret).append(closeItem);
	
	$(closeItem).click(function(e)
	{
		e.stopPropagation(); // so it doesnt go through the button :)
		leaveChannel(this.channelId);
	});
	
	$(ret).click(function()
	{
		switchToChannel(this.channelId);
	});
	
	return ret;
}

function ChannelChatItem(id)
{
	var ret = document.createElement("div");
	ret.className = "panel-body channel-chat";
	ret.id = "channel-chat-" + id;
	ret.channelId = id;
	ret.scrollTop = ret.scrollHeight;
	
	var chat = document.createElement("div");
	chat.className = "channel-chat-chat";
	chat.id = "channel-chat-chat-" + id;
	
	var input = document.createElement("input");
	input.type = "text";
	input.className = "form-control channel-chat-input";
	input.id = "channel-chat-input-" + id;
	
	var send = document.createElement("button");
	send.type = "button";
	send.className = "btn btn-primary channel-chat-send";
	send.id = "channel-chat-send-" + id;
	send.innerHTML = "Send";
	
	var players = document.createElement("ul");
	players.className = "channel-chat-players";
	players.id = "channel-chat-players-" + id;
	
	$(ret).append(chat);
	$(ret).append(input);
	$(ret).append(send);
	$(ret).append(players);
	
	var sendLine = function()
	{
		var text = input.value;
		
		if (text)
		{
			input.value = "";
			relay.send("chat", { "message": text, "channel": id });
		}
	};
	
	$(send).click(function()
	{
		sendLine();
	});
	
	$(input).keypress(function(e)
	{
		if (e.which === 13)
		{
			sendLine();
		}
	});
	
	return ret;
}
