var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http).listen(3000);

var Users = [];
var Game = 0;
const echec = 0,
	  host = 1,
	  player = 2;


io.sockets.on('connection', function(socket){


	socket.on('newUser', function(data, callback){
		if (data['name'] in Users || (Object.keys(Users).length == 1 && Game == 0)){
			console.log("user : "+data['name'] + " exist");
			socket.emit('newGame', {status: echec});
		}
		else {
			console.log("new user : "+data['name']);
			
			var status  = (Game == 0 ? host : player);
			Users[data['name']] = [];
			Users[data['name']]['status'] = status;
			Users[data['name']]['id'] = Object.keys(Users).length;
			socket.emit('newGame', {status: status});
		}
	});

	socket.on('nbJoueurs', function(data, callback){
		Game = data["nbJoueurs"];
	});

});