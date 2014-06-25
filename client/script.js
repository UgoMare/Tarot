var socket = io.connect('http://localhost:3000');
const echec = 0,
	  host = 1,
	  player = 2;

Player  = [];

jQuery(function($){
	$(".bouton#jouer").click(function(){
			var name = $("input:text").val();
			if (name != ""){
				console.log(name);
				socket.emit('newUser', {name: name}, function(data){
					console.log("trying connection "+ name);
				});
			}
	});


	$(".boutonJoueurs").click(function(){
			var nb = this.id;
			$("#nbJoueurs").css("display", "none");
			socket.emit('nbJoueurs', {nb: nb});
			// $("#players").prepend
	});


	socket.on('newGame', function(data, callback){
	if (data['status'] == echec)
		$("input:text").val("Mauvais pesudo !");
	else {
			Player["status"] = data['status'];
			$("#register").css("display", "none");
			$("#game").css("display", "block");
			if (Player['status'] == host)
				$("#nbJoueurs").css("display", "block");
		}
	});
});