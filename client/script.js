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
		deck();

		$("#deck .carte").bind("click", function(){
			this.remove();
			deck();
		});


		}
	});
});


function deck(){
	var nbcartes = $('#deck > *').length;
	console.log(nbcartes);

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


// ((nbcartes * 70) - 940) / (nbcartes - 1)
//pas de marge sur la 1er
