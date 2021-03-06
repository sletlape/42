// Modules
var validator = require('validator');
var emo = require('emojione');

// Controllers
var db = require('./database.js');
var server = require('./server.js');
var util = require('./utils.js');

module.exports = {
	start: function(storeSess) {
		// Web Socket
		server.getWss().on('connection', function(ws) {
			if (ws.upgradeReq.headers.cookie) {
				var sessId = ws.upgradeReq.headers.cookie.split("s%3A")[1].split(".")[0];
				storeSess.get(sessId, function(err, sess) {

					ws.username = sess.username;
					ws.setSession = function(session) {
						storeSess.set(ws.upgradeReq.headers.cookie.split("s%3A")[1].split(".")[0], session);
					}
				});
			}

			ws.on('close', function() {
				server.getWss().clients.forEach(function(client) {
					try {
						client.send(JSON.stringify({
							act: 'disconnect',
							name: validator.escape(ws.username)
						}));
					}
					catch(e) {}
				});
				db.update("profiles", {
					username: validator.escape(ws.username)
				}, {
					$set: {
						time: Date.now()
					}
				});
			});

			ws.on('message', function(message) {
				try {
		    		var res = JSON.parse(message);
					if (res.act === "open") {
						server.getWss().clients.forEach(function(client) {
							try {
								client.send(JSON.stringify({
									act: 'connect',
									name: validator.escape(ws.username)
								}));
							}
							catch(e) {}
						});
						db.update("profiles", {
							username: validator.escape(ws.username)
						}, {
							$set: {
								time: false
							}
						});
					}
					else if (res.act === "message") {
						if (res.message && res.to && res.to != ws.username) {
							db.get("block", function(data) {
								if (data.length == 0) {
									server.getUser(res.to).forEach(function(user) {
										server.sendData(user, {
											act: "message",
											role: "receiver",
											from: validator.escape(ws.username),
											message: emo.toImage(validator.escape(res.message))
										});
									});
									server.getUser(ws.username).forEach(function(user) {
										server.sendData(user, {
											act: "message",
											role: "sender",
											message: emo.toImage(validator.escape(res.message))
										});
									});
									db.insert("notifs", {
										username: validator.escape(res.to),
										from: validator.escape(ws.username),
										message: emo.toImage(validator.escape(res.message))
									});
									db.get("messages", function(data) {
										if (data.length == 1) {
											db.update("messages", {
												_id: data[0]._id
											}, {
												$addToSet: {
													messages: {
														from: validator.escape(ws.username),
														date: new Date().toISOString(),
														message: emo.toImage(validator.escape(res.message))
													}
												}
											});
										}
										else {
											db.insert("messages", {
												users: [
													ws.username,
													res.to
												],
												messages: [
													{
														from: validator.escape(ws.username),
														date: new Date().toISOString(),
														message: emo.toImage(validator.escape(res.message))
													}
												]
											});
										}
									}, {
										$and: [{
											users: {
												$in: [
													validator.escape(ws.username)
												]
											}
										}, {
											users: {
												$in: [
													validator.escape(res.to)
												]
											}
										}]
									});
								}
							}, {
								'users.0': validator.escape(res.to),
								'users.1': validator.escape(ws.username)
							});
						}
					}
				} catch (e) {}
			});
		});
	}
};
