var relay;
var cache = {};

var myInfo = {};

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