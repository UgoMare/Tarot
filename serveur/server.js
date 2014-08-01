var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http).listen(3000);

var cartes = new Array('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','Excuse','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','d1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12','d13','d14','h1','h2','h3','h4','h5','h6','h7','h8','h9','h10','h11','h12','h13','h14','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14');

var Users = [],
Names  = [],
Chien = [],
Game = [],
First = -1,
JoueurCourant = -1,
DejaJoue = 0,
TypeJeu = {passe:1, prend:2, garde:3, gardesans:4, gardecontre:5};
Appels = {kc: "Tr&eagrave;fle", kh: "Coeur", ks: "Pique", kd: "Carreau"};
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
			var status  = (Game["status"] == -1 ? host : player);
			id = Object.keys(Users).length;
			Users[id] = [];
			Names.push(data['name']);
			Users[id]['name'] = data['name'];
			Users[id]['socket'] = socket;
			Users[id]['status'] = status;
			Users[id]['main'] = [];
			Users[id]['tas'] = [];
			Users[id]['choix'] = 0;
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
		Game['status'] = data;
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


function newPlayer(id)
{
for (var i = 0; i < Object.keys(Users).length; i++) {
		if (Users[i]['socket'] != socket)
			Users[i]['socket'].emit('newPlayer', {id: id, name: Users[id]['name']});
		socket.emit('initPlayer', {id: i, name: Users[i]['name']});
	}
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


	function suivant(){
		if (JoueurCourant == -1)
			JoueurCourant = First;
		else
			JoueurCourant = (JoueurCourant + 1) % Game['status'];
	}

	function quiPrend(Joueur){

		Users[Joueur]["socket"].emit('quiPrend');
		for (var i = 0; i < Object.keys(Users).length; i++){
			Users[i]["socket"].emit('tour', {joueur: JoueurCourant, banniere: Users[JoueurCourant].name+" fait son annonce !"});
		}
		console.log("DejaJoue "+DejaJoue);
	}

	socket.on("quiPrend", function (data, callback) {
		console.log("joueur : "+ Users[data['id']].name+" "+data["status"]);
		Users[data['id']]["choix"] = TypeJeu[data["status"]];
		DejaJoue = DejaJoue + 1;

		for (var i = 0; i < Object.keys(Users).length; i++){
			Users[i]["socket"].emit('statusPrise', {id: data['id'], status: data['status']});
		}
		if (DejaJoue < Game['status']){
			suivant();
			quiPrend(JoueurCourant);
		}
		if (DejaJoue == Game['status']){
			console.log("Chien");
			Appel();
		}
	});

	socket.on('appel', function (data, callback){
		console.log(data);
		console.log("Joueur : "+Users[First].name+" appel le Roi de "+Appels[data]);
		var status = "Roi de "+Appels[data];
		for (var i = 0; i < Object.keys(Users).length; i++){
			Users[i]["socket"].emit('tour', {joueur: First, banniere: Users[First].name+" appel le roi de "+Appels[data]});
			Users[i]["socket"].emit('statusJoueur', {id: First, status: status});
			Users[i]["socket"].emit('cadrePrise', {id: First});
		}
		JouerChien();
	});

	socket.on('chien', function (data, ccallback) {
		console.log("la partie commence !");
		Chien = data;
		for (var i = 0; i < Game['chien'].length; i++) {
			Users[First]['main'].push(Game['chien'][i]);
		}

		console.log("Nouvelle main du joueur avec le chien "+Users[First]['main']);
		Play();
	});

	socket.on("play", function () {
	});

	function Play() {
		console.log("Game!");
	}

	function Appel(){
		Firsttmp = -1;
		var choix = 0;
		console.log("appel");
		for (var i = 0; i < Object.keys(Users).length; i++){
			if (Users[(First + i) % Game['status']]["choix"] > choix){
				Firsttmp = ((First + i) % Game['status']);
				choix = Users[(First + i) % Game['status']]["choix"];
			}
		}
		First = Firsttmp;
		console.log("choix "+choix+" first "+First);
		for (var i = 0; i < Object.keys(Users).length; i++){
			Users[i]["socket"].emit('choix', {joueur: First, choix: choix});
		}

		if (Game['status'] == 5){
			console.log("partie a 5");
			for (var i = 0; i < Object.keys(Users).length; i++){
				Users[i]["socket"].emit('tour', {joueur: First, banniere: Users[First].name+" fait son appel !"});
			}
			Users[First]["socket"].emit('appel');
		}
		else {
			for (var i = 0; i < Object.keys(Users).length; i++){
				Users[i]["socket"].emit('tour', {joueur: First, banniere: ""});
			}
			JouerChien();
		}
	}



	function JouerChien(){
		console.log("->chien");
		console.log(Game['chien']);
		for (var i = 0; i < Object.keys(Users).length; i++){
			Users[i]["socket"].emit('chien', {id: First, chien: Game['chien']});
		}

		// First = -1;
		// var choix = 0;

		// for (var i = 0; i < Object.keys(Users).length; i++){
		// 	if (Users[i]["choix"] > choix){
		// 		First = i;
		// 		choix = Users[i]["choix"];
		// 	}
		// }

		// for (var i = 0; i < Object.keys(Users).length; i++){
		// 	Users[i]["socket"].emit('tour', {joueur: First, banniere: Users[First].name+" fait son annonce !"});
		// }

	//		console.log("User: "+First+" avec le choix "+choix);

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
	suivant();
	quiPrend(First);
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
