var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port + '/');

ws.onerror = function(err) {
	console.log(err);
}
ws.onopen = function () {
	console.log('WS :)');
};
function sendData(obj) {
	try {
		ws.send(JSON.stringify(obj));
	}
	catch(e) {
		console.log("Error sendData : " + e);
	}
}
