$(document).ready(function() {
	//Velocidad con la que aparecen las bolas
	var vel = 1000;

	//Variable que determina si ha terminado el juego
	var gameover = false;


	for (var i = 1; i <= 90; i++) {
		$(".bolsalidas").append('<td class="redonda" id="b'+i+'">'+i+'</td>');
		if(i==30||i==60){
			$(".bolsalidas").append('<br/>');
		}
	}

	//Todo lo relativo al panel de selección debe estar disponible
	$("#comenzar").prop('disabled', false);
	$("#carton").prop('disabled', false);
	$("#jugadores").prop('disabled', false);
	//Variable que se encarga del intervalo, para parar el intervalo se usa la función clearInterval(temp)
	var temp;
	var jugadores;
	var valorcarton;
	//Array donde guardaré los números del cartón del usuario
	var miCarton = new Array();
	//Array donde guardaré los números que van saliendo del bombo
	var numerosSalidos = new Array();
	//Array donde guardaré los cartones de todos los oponentes
	var oponentes = new Array();
	var filaUlt;
	
	$("[type='number']").keypress(function (evt) {
	    evt.preventDefault();
	});

	var bombo = new Array();
	for(var i = 1; i <= 90; i++){
		bombo[i-1]=i;
	}

	//Creo la visualización del cartón
	for(var i = 0; i<9 ; i++){
		var ran = Math.floor((Math.random() * 9) + 1);
		
		do{
			var ran2 = Math.floor((Math.random() * 9) + 1);
		}while(ran == ran2);
		do{
			var ran3 = Math.floor((Math.random() * 9) + 1);
		}while(ran3 == ran2 || ran3 == ran);

		var orden = new Array();
		orden = [ran, ran2, ran3];
		orden.sort();

		$("#fila1").append('<td class="num" id="'+(i*10+ran)+'">'+(i*10+orden[0])+'</td>');
		$("#fila2").append('<td class="num" id="'+(i*10+ran2)+'">'+(i*10+orden[1])+'</td>');
		$("#fila3").append('<td class="num" id="'+(i*10+ran3)+'">'+(i*10+orden[2])+'</td>');
	}

	//Quito 4 números por cada fila
	quita("#fila1");
	quita("#fila2");
	do{
		filaUlt = quita("#fila3","#fila2","#fila1");
	}while(filaUlt==false)
	

	//Guardo el cartón en el array
	guardaMiCarton();

	//Cambio el estilo para tachar un número
	$(".num").click(function() {
		$(this).toggleClass('seleccionado');
	});
	
	$("#bingo").click(Bingo);

	//Comienza el bingo
	$("#comenzar").click(function() {
		valorcarton = $("#carton").val();
		jugadores = $("#jugadores").val();
		$("#comenzar").prop('disabled', true);
		$("#carton").prop('disabled', true);
		$("#jugadores").prop('disabled', true);
		temp = setInterval(sacaBola, vel);
		
		for(var i=0; i<jugadores; i++){
			oponentes[i]=CreaOponente();
		}


		$(".cuerpo").css('display', 'inline');
		$(".cuerpo").hide(0);
		$(".cuerpo").fadeIn(100);
	});
	//Función para quitar 4 números por cada fila
	//Se le pasa ID de la fila como parámetro
	function quita(x,filaanterior,filaanterior2){
		var ran = Math.floor((Math.random() * 9));
		
		do{
			var ran2 = Math.floor((Math.random() * 9));
		}while(ran == ran2);
		do{
			var ran3 = Math.floor((Math.random() * 9));
		}while(ran3 == ran2 || ran3 == ran);
		do{
			var ran4 = Math.floor((Math.random() * 9));
		}while(ran4 == ran2 || ran4 == ran || ran4 == ran3);

		//Compruebo que no se formen columnas de imagen
		for(var i=0; i<9;i++){
			if(i == ran || i == ran2 || i == ran3 || i == ran4){
				if($(""+filaanterior+" td").eq(i).attr('class') == "bo" && $(""+filaanterior2+" td").eq(i).attr('class') == "bo"){
					return false;	
				} 
			}				
		}

		for(var i=0; i<9;i++){
			if(i == ran || i == ran2 || i == ran3 || i == ran4){
				$(""+x+" td").eq(i).replaceWith('<td class="bo"><img class="img-fluid" src="assets/img/bombo.png" /></td>');
			}				
		}
		
		return true;
	}
	



	//Función para guardar el cartón del usuario en un array
	function guardaMiCarton(){
		for(var i = 0; i<15; i++){
			miCarton[i] = $(".num").eq(i).attr('id');
		}
	}

	//El usuario canta bingo
	function Bingo(){
		var iguales = 0;
		for(var i=0; i<numerosSalidos.length; i++){
			if(miCarton.includes(numerosSalidos[i])){
				iguales++;
			}
		}
		if(iguales == miCarton.length){
			clearInterval(temp);
			$(".modal-body").replaceWith("<div class='modal-body'><i style='color: green' class='fa fa-check fa-5x' aria-hidden='true'></i><br/>¡Has ganado!<br/>El premio asciende a "+Premio(ganadores)+" €</div>");
			gameover = true;
		}
		else{
			clearInterval(temp);
			$(".modal-body").replaceWith("<div class='modal-body'><i style='color: red' class='fa fa-times fa-5x' aria-hidden='true'></i><br/>Bingo incorrecto...</div>");
			
		}
	}
	//Se reanuda el juego
	$('#flipFlop').on('hidden.bs.modal', function (e) {
		if(gameover == false){
			temp = setInterval(sacaBola, vel);
		}
		else{
			location.reload(true);
		}
  		
	})


	//Petición AJAX que saca una bola del bombo
	function sacaBola(){		
			  $.ajax({
			           async:true,
			           type: "POST",
			           dataType: "text",			           
			           url:"peticion.php",
			           data:{bola: bombo},			           
			           success: function(resp) {
			           	$("#bola").hide(0);//Principio de la animación, se oculta el círculo
			           	$("#bola").html(resp);			       
			           	
			           	numerosSalidos.push(resp);
			           	bombo.splice(bombo.indexOf(parseInt(resp)),1);
			           	
			           	$("#bola").fadeIn(400);//Aparece con el nuevo número
			           	$("#b"+resp).hide(0);
			           	$("#b"+resp).css('background', 'lightcoral');
			           	$("#b"+resp).fadeIn(400);
			           	BingoOponente();
			           } 			           
			         }); 
			  return false;
	}

	//Comprueba el bingo de los oponentes
	function BingoOponente(){
		var ganadores = 0;
		for(var i = 0; i < oponentes.length; i++){
			var iguales = 0;
			for(var c=0; c<numerosSalidos.length; c++){				
				for(var z=0; z<numerosSalidos.length; z++){
					if(oponentes[i][z] == numerosSalidos[c]){
						iguales++;
					}
				}
			}
			if(iguales == oponentes[i].length){
				ganadores++;				
			}
		}
		if(ganadores>0){
			$('#flipFlop').modal('show');
			clearInterval(temp);
			if(ganadores>1){
				$(".modal-body").replaceWith("<div class='modal-body'><i style='color: blue' class='fa fa-child fa-5x' aria-hidden='true'></i><br/>"+ganadores+" jugadores han cantado bingo.<br/>El premio asciende a "+Premio(ganadores)+" €</div>");
				gameover = true;
			}
			else{
				$(".modal-body").replaceWith("<div class='modal-body'><i style='color: blue' class='fa fa-child fa-5x' aria-hidden='true'></i><br/>1 jugador ha cantado bingo.<br/>El premio asciende a "+Premio(ganadores)+" €</div>");
				gameover = true;
			}
			
		}
		
	}

	//Función que crea los cartones de los oponentes
	function CreaOponente(){
		var carton = new Array();
		for(var i = 0; i<9 ; i++){
			var ran = Math.floor((Math.random() * 9) + 1);
			
			do{
				var ran2 = Math.floor((Math.random() * 9) + 1);
			}while(ran == ran2);
			do{
				var ran3 = Math.floor((Math.random() * 9) + 1);
			}while(ran3 == ran2 || ran3 == ran);

			var n1 = i*10+ran;
			var n2 = i*10+ran2;
			var n3 = i*10+ran3;
			carton.push(n1);
			carton.push(n2);
			carton.push(n3);
		}
		
		for(var i = 0; i<12; i++){
			var ran = Math.floor((Math.random() * (carton.length-1)));
			carton.splice(ran, 1);
		}
		return carton;
	}

	function Premio(ganadores){
		return ((jugadores*valorcarton)/ganadores)*0.8;
	}
});