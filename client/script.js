var socket = io.connect('http://localhost:3000');
const echec = 0,
	  host = 1,
	  player = 2;

var Game = -1;
var Player  = [],
Users = [];

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
			console.log(nb);
			$("#nbJoueurs").css("display", "none");
			socket.emit('nbJoueurs', nb);
			$(".banniere").html("En attente de joueurs");
			$("#deck").css("display", "block");
			for (var i = 0; i < (nb == 4 ? 18 : 15); i++)
				ajoutCarte(i, "dos");
			deck();
	});


	socket.on('newGame', function(data, callback){
	if (data['status'] == echec)
		$("input:text").val("Mauvais pesudo !");
	else {

			Game = data["game"];
			Player["status"] = data['status'];
			Player["name"] = data["name"];
			Player["id"] = data["id"];
			Users[data["id"]] = Player;
			$("#register").css("display", "none");
			$("#game").css("display", "block");
			if (Player['status'] == host)
				$("#nbJoueurs").css("display", "block");
			else {
				$(".banniere").html("En attente de joueurs"); 
				$("#deck").css("display", "block");
				for (var i = 0; i < (Game == 4 ? 18 : 15); i++)
					ajoutCarte(i, "dos");
				deck();
			}
	
		// deck();

		// $("#deck .carte").bind("click", function(){
		// 	this.remove();
		// 	deck();
		// });
		}
	});

	socket.on('initPlayer', function(data, callback){
		console.log(data['id']);
		$("#players").append("<div class='player' id='"+data['id']+"'><div class='name'>"+data['name']+"</div><div class='carte'></div></div>");

	});

	socket.on('newPlayer', function(data, callback){
		console.log(data['id']);
		$("#players").append("<div class='player' id='"+data['id']+"'><div class='name'>"+data['name']+"</div><div class='carte'></div></div>");

	});


	socket.on('votreMain', function(data, callback){
		console.log(data);
		$("#deck > *").remove();
		for (var i = 0; i < data['main'].length; i++)
			ajoutCarte(i, data['main'][i]);
		deck();
	});
});


function deck(){
	var nbcartes = $('#deck > *').length;
	if (nbcartes >= 14){
		var margin = ((nbcartes * 70) - 940) / (nbcartes - 1);
		console.log(margin);
		$(".carte").css("margin-left", "-"+margin+"px");
	}
	else{
		$(".carte").css("margin", "0");	
		$("#deck").css("width", (nbcartes*70)+"px")
	}
}

function ajoutCarte(id, name){
	$("#deck").append("<img class='carte' id='"+id+"'' src='img/cartes/"+name+".jpeg'>");
}

// ((nbcartes * 70) - 940) / (nbcartes - 1)
//pas de marge sur la 1er
