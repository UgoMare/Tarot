var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http).listen(3000);

var cartes = new Array('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','Excuse','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','d1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12','d13','d14','h1','h2','h3','h4','h5','h6','h7','h8','h9','h10','h11','h12','h13','h14','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14');

var Users = [],
Names  = [],
Chien = [],
Game = [],
First = -1;
Game['status'] = -1;

const echec = 0,
	  host = 1,
	  player = 2;


io.sockets.on('connection', function(socket){


	socket.on('newUser', function(data, callback){

		if (Names.indexOf(data['name']) != -1 || (Object.keys(Users).length == 1 && Game["status"] == -1) || (Game["status"] != -1 && Object.keys(Users).length == Game["status"])){
			console.log("user : "+data['name'] + " exist");
			socket.emit('newGame', {status: echec});
		}
		else {
			console.log("new user : "+data['name']);
			var status  = (Game["status"] == -1 ? host : player);
			id = Object.keys(Users).length;
			Users[id] = [];
			Names.push(data['name']);
			Users[id]['name'] = data['name'];
			Users[id]['socket'] = socket;
			Users[id]['status'] = status;
			Users[id]['main'] = [];
			Users[id]['tas'] = [];
			socket.emit('newGame', {game: Game['status'], name: data['name'], status: status, id: id});
			newPlayer(id);
		}
		if (Game["status"] != -1 && Object.keys(Users).length == Game["status"]){
			//game start
			console.log("Game Start with "+Game["status"]+" players !")
			Start();
		}
	});

	socket.on('nbJoueurs', function(data, callback){
		console.log("game "+data);
		Game["status"] = data;
		Game['chien'] = [];
		if (data == 4){
			Game["nbmain"] = 18;
			Game["nbchien"] = 6;
		}
		else if (data == 5){
			Game["nbmain"] = 15;
			Game["nbchien"] = 3;
		}
	});



	function randomInt(mini, maxi)
	{
	     var nb = mini + (maxi+1-mini)*Math.random();
	     return Math.floor(nb);
	}
	 
	Array.prototype.shuffle = function(n)
	{
	     if(!n)
	          n = this.length;
	     if(n > 1)
	     {
	          var i = randomInt(0, n-1);
	          var tmp = this[i];
	          this[i] = this[n-1];
	          this[n-1] = tmp;
	          this.shuffle(n-1);
	     }
	}

	function newPlayer(id){
	for (var i = 0; i < Object.keys(Users).length; i++) {
			if (Users[i]['socket'] != socket)
				Users[i]['socket'].emit('newPlayer', {id: id, name: Users[id]['name']});
			socket.emit('initPlayer', {id: i, name: Users[i]['name']});
		};
	}

	function sortCartes(cartes){
		cartes.sort(function (a, b) {
  		function chunkify(t) {
   		 	var tz = [], x = 0, y = -1, n = 0, i, j;
    	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      		var m = (i == 46 || (i >=48 && i <= 57));
      		if (m !== n) {
        		tz[++y] = "";
        		n = m;
      		}
      		tz[y] += j;
    	}
    	return tz;
  	}
  	var aa = chunkify(a);
  	var bb = chunkify(b);

	  for (x = 0; aa[x] && bb[x]; x++) {
    	if (aa[x] !== bb[x]) {
      		var c = Number(aa[x]), d = Number(bb[x]);
      		if (c == aa[x] && d == bb[x])
        		return c - d;
      		else
      			return (aa[x] > bb[x]) ? 1 : -1;
    	}
  	}
  	return aa.length - bb.length;
	});
	}

	function Start(){
	// var cartes = new Array(78);

	// for (var i = cartes.length - 1; i >= 0; i--)
	// 	cartes[i] = i;
	First = Math.floor((Math.random() * Game["status"]));

	console.log("Player : "+Users[First]["name"]+" start !");
	cartes.shuffle();
	// console.log(cartes);

	var cur = 0;
	for (var i = 0; i < Game['nbmain']/3; i++) {
		for (var j = 0; j < Game['status']; j++)
		{
			console.log(cartes[cur]);
			Users[(First + j) % Game['status']]['main'].push(cartes[cur]);
			Users[(First + j) % Game['status']]['main'].push(cartes[cur + 1]);
			Users[(First + j) % Game['status']]['main'].push(cartes[cur + 2]);
			cur = cur + 3;
		}
		if (i < Game['nbchien']){
			Game['chien'].push(cartes[cur]);
			cur = cur + 1;
		}
	}

	for (var i = 0; i < Object.keys(Users).length; i++){
		sortCartes(Users[i]["main"])
		Users[i]["socket"].emit('votreMain', {main: Users[i]["main"]});
	}

	// sortCartes(Users[0]['main']);
	// sortCartes(Users[1]['main']);
	// sortCartes(Users[2]['main']);
	// sortCartes(Users[3]['main']);
	sortCartes(Game['chien']);

	// console.log(Users[0]['main']);
	// console.log(Users[1]['main']);
	// console.log(Users[2]['main']);
	// console.log(Users[3]['main']);
	// console.log(Game['chien']);
	}

	// sortCartes(cartes)
	// console.log(cartes);

//console.log(cartes[10]);

// Start();
});		