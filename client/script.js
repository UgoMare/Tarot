var socket = io.connect('http://localhost:3000');
const echec = 0,
host = 1,
player = 2;

var Game = -1,
currentSelected = -1,
id = -1,
Chien = [],
Player = [],
Users = [];

var Status = {passe:"passe", prend:"prend", garde:"garde", gardesans:"garde sans", gardecontre:"garde contre"};

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
		var nbJoueurs = this.id;
		nb = (nbJoueurs == "4joueurs" ? 4 : 5)
		console.log(nb);
		$("#nbJoueurs").css("display", "none");
		socket.emit('nbJoueurs', nb);
		$(".banniere").html("En attente de joueurs");
		$("#deck").css("display", "block");
		for (var i = 0; i < (nb == 4 ? 18 : 15); i++)
			ajoutCarte("deck", i, "dos");
			deck("deck", 940);
			$("#bas").css("display", "block");
			for (var i = 0; i < (nb == 4 ? 6 : 3); i++)
				ajoutCarte("chien", "C"+i, "dos");
				deck("chien", 420);
			});

			socket.on('newGame', function(data, callback){
				if (data['status'] == echec)
					$("input:text").val("Mauvais pesudo !");
					else {
						console.log("game status "+data['status']);
						Game = data["game"];
						Player["status"] = data['status'];
						Player["name"] = data["name"];
						Player["id"] = data["id"];
						Users[data["id"]] = Player;
						$("#register").css("display", "none");
						$("#game").css("display", "block");
						if (Player['status'] == host){
							$("#nbJoueurs").css("display", "block");
						}
						else {
							$(".banniere").html("En attente de joueurs");
							$("#deck").css("display", "block");
							for (var i = 0; i < (Game == 4 ? 18 : 15); i++){
								ajoutCarte("deck", i, "dos");
							}
							deck("deck", 940);
							$("#bas").css("display", "block");
							for (var i = 0; i < (Game == 4 ? 6 : 3); i++){
								ajoutCarte("chien", "c"+i, "dos");
							}
							deck("chien", 420);
						}

						// deck();

						// $("#deck .carte").bind("click", function(){
						// 	this.remove();
						// 	deck();
						// });
					}
				});



				$("#infosPartie .bouton ").click(function(){
					console.log(this.id);
					$('.titleinfo').html("");
					$("#infosPartie #chien").css("display", "block");
					$("#infosPartie #choix").css("display", "none");
					socket.emit('quiPrend', {id: id, status: this.id});
				});

				socket.on('initPlayer', function(data, callback){
					console.log(data['id']);
					id = data['id'];
					var newPlayer = [];

					newPlayer["name"] = data["name"];
					newPlayer["id"] = data["id"];
					Users[data["id"]] = newPlayer;

					$("#players").append("<div class='player' id='"+data['id']+"'><div class='name'>"+data['name']+"</div><div class='status'></div><div class='carte'></div></div>");

				});

				socket.on('newPlayer', function(data, callback){
					console.log("New player : "+data['name']+" with id "+data['id']);
					var newPlayer = [];

					newPlayer["name"] = data["name"];
					newPlayer["id"] = data["id"];
					Users[data["id"]] = newPlayer;

					$("#players").append("<div class='player' id='"+data['id']+"'><div class='name'>"+data['name']+"</div><div class='status'></div><div class='carte'></div></div>");

				});

				socket.on('votreMain', function(data, callback){
					console.log(data);
					Player['main'] = data['main'];
					$("#deck > *").remove();
					for (var i = 0; i < data['main'].length; i++)
						ajoutCarte("deck", data['main'][i], data['main'][i]);
						deck("deck", 940);
					});

				socket.on('quiPrend', function (data, callback) {
					console.log("ce joueur prend ?");
					$('.titleinfo').html("Votre annonce");
					$("#infosPartie #chien").css("display", "none");
					$("#infosPartie #choix").css("display", "block");
				});

				socket.on('choix', function (data, callback) {
					$(".player .status").html("");
					$(".player#"+data['joueur']).css("background-image", "url('img/cadre2.gif')");
					// $(".player#"+data['joueur']+" .status").html(data['choix']);
					// $(".banniere").html(Users[data['joueur']]+" prend avec une "+data['choix']);
				});

				socket.on('statusPrise', function (data, callback) {
					console.log("status "+data['status']);
					$("#"+data['id']+" .status").html(Status[data['status']]);
				});

				socket.on('statusJoueur', function (data, callback) {
					console.log("status "+data['status']);
					$("#"+data['id']+" .status").html(data['status']);
				});

				socket.on('tour', function (data, callback) {
					console.log("tour "+data["joueur"] + " "+data['banniere']);
					fleche(data['joueur'], data["banniere"]);
				});

				socket.on('prise', function (data, callback) {
				});

				socket.on('appel', function (data, callback) {
					console.log("appel");
					$('.titleinfo').html("Votre appel");
					$("#infosPartie #chien").css("display", "none");
					$("#infosPartie #appel").css("display", "block");
					$("#appel .carte").bind("click", function(){
						console.log(this.id);
						socket.emit('appel', this.id);
						$("#infosPartie #chien").css("display", "block");
						$("#infosPartie #appel").css("display", "none");
					});
				});

				socket.on('chien', function (data, callback) {
					console.log("chien");
					console.log(data["chien"]);
					$("#chien").empty();

					for (var i = 0; i < data['chien'].length; i++){
						ajoutCarte("chien", data['chien'][i], data['chien'][i]);
						}
						if (data['id'] == Player['id']){
							for (var i = 0; i < data['chien'].length; i++) {
								Player['main'].push(data['chien'][i]);
							}
							sortCartes(Player['main']);
							$("#deck").empty();
							for (var i = 0; i < Player['main'].length; i++)
								ajoutCarte("deck", Player['main'][i], Player['main'][i]);
							deck("deck", 940);
						}
						deck("chien", 420);
						$(".banniere").html(Users[data['id']].name+" fait son chien");
						$('.titleinfo').html("Le chien de "+Users[data['id']].name);

						if (data['id'] == Player['id']){
							console.log("-> bind active");
							$("#deck .carte").bind("click", selectChien);
						}
					});

						function selectChien(){
							console.log("selectChien");
							console.log("id de la carte "+this.id);
							console.log("taille du chien "+Chien.length);

							if (Chien.length < (Game == 4 ? 6 : 3)){
								Chien.push(this.id);

								//////ajout de l'image
								$("#"+this.id).attr("src", "img/layerselect.gif");
								$("#"+this.id).css("content", "initial");
								$("#"+this.id).unbind("click", selectChien);
								$("#"+this.id).bind("click", unselectChien);

								if (Chien.length == (Game == 4 ? 6 : 3)){
									$("#deck .carte").unbind("click");
									socket.emit('chien', Chien);
									for (var i = 0; i < Chien.length; i++) {
										$("#"+Chien[i]).remove();
										Player['main'].pop(Chien[i]);
									};
									deck("deck", 940);
								}
							}
						}

						function unselectChien(){
							console.log("suppresion de la carte "+this.id);
							console.log("taille du chien "+Chien.length);

								Chien.pop(this.id);

								//////ajout de l'image
								$("#"+this.id).removeAttr("src");
								$("#"+this.id).css("content", "");
								$("#"+this.id).bind("click", selectChien);
								$("#"+this.id).unbind("click", unselectChien);
						}


						function deck(deckid, decksize){
							var nbcartes = $('#'+deckid+' > *').length;
							if (nbcartes >= 14){
								var margin = ((nbcartes * 70) - decksize) / (nbcartes - 1);
								console.log(margin);
								$("#"+deckid+" .carte").css("margin-left", "-"+margin+"px");
							}
							else{
								$("#"+deckid+" .carte").css("margin", "0");
								$("#"+deckid).css("width", (nbcartes*70)+"px")
							}
						}

						function fleche(newSelected, banniere){
							console.log("new selected "+newSelected);
							if(banniere)
								$(".banniere").html(banniere);
								if (newSelected != -1)
									$("#"+currentSelected).removeClass("selected");
									$("#"+newSelected).addClass("selected");
									currentSelected = newSelected;
								}

								function ajoutCarte(deckid, id, name){
									$("#"+deckid).append("<img class='carte' id='"+id+"' src='' style='background-image: url(\"img/cartes/"+name+".jpeg\");'>");
								}

								// ((nbcartes * 70) - 940) / (nbcartes - 1)
								//pas de marge sur la 1er
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

});
