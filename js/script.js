var messageHandlers =
{
	"servers": function(data)
	{
		
	}
};

function connectToRegistry()
{
	relay = new Relay("server.pokemon-online.eu:10508", handleOpen, handleMessage, handleClose, handleError);
}

function handleMessage(msg)
{
	var received = msg.data.toString();
	//console.log("received: " + received);
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
}

function handleError(data)
{

}