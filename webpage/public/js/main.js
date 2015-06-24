$(function(){
		var socket = io();
		var myUserNum;
		var secretWord;
		var palavra_index = 0;
		var showWord = "";
		var wordIterator = 0;
		var wordsArray;
		var score;

		// Other things from here

		function gameOn(){
			secretWord = wordsArray[wordIterator];
			createShowWord(secretWord);
			updateLabels();
			wordIterator ++;
		}

		function createShowWord(word){
			for (var i = 0 ; i < word.length; i++) {
		    	showWord += "_";
			};
		}
		
		function updateLabels(){
			$('#middleRow1 #centerwrap').text(secretWord);
			$('#middleRow2 #centerwrap').text(showWord);			
		}

		function updateScore(points, scoreElement){
			console.log('chamou');
			score = parseInt($('#'+scoreElement).find('#score').text(), 10);
			score += points;


			var content = score + '';
			var fix = '';


			for(var i=0; i<5 - content.length; i++){
				fix += '0';
			}
			$('#'+scoreElement).find('#score').text(fix + content);
		}

		function receiveScore(points, scoreElement){
			//send score to server
			var content = points + '';
			var fix = '';


			for(var i=0; i<5 - content.length; i++){
				fix += '0';
			}
			$('#'+scoreElement).find('#score').text(fix + content);
		}

		
		
		$(document).keypress(function(e) {
			if($('.error').hasClass('warning')){

			}else{
				console.log(e.which);
				console.log(secretWord.charCodeAt(palavra_index));
			    if(secretWord.charCodeAt(palavra_index) == e.which || 
			    	( (e.which >= 65 && e.which << 90 && e.which == secretWord.charCodeAt(palavra_index) - 32) || (e.which >= 97 && e.which << 122 && e.which == secretWord.charCodeAt(palavra_index) + 32 ) ) 
			    	){
			        palavra_index++;
			        updateScore(10, 'myScore');
			  		socket.emit('update Score', score);
			        $('#middleRow2 #centerwrap').text(secretWord.substr(0, palavra_index) + showWord.substr(0 + palavra_index, showWord.length));

			        if(palavra_index == secretWord.length){
			        	youGotIt();
			        	socket.emit('user got it');
			        	gameOn();
			        }
			    }else{
			      stopOnError();
			    }
			}
 	  	});



		function addUser(){
			socket.emit('add user', 'Player');
		}
		
		addUser();

		socket.on('login', function (data) {
				console.log('login');
			    connected = true;
			    if (data.numUsers == 1) {
			    	$(upperRow).append('<span id="waiting_for">Waiting for challenger</span>');	
			    }else{
			    	$(upperRow).append('<span id="waiting_for">Let the games begin!</span>');
			    	socket.emit('sortear palavras');	
			    }
		});

		socket.on('change Score', function(data){
			if(data.username != ('Player ' + myUserNum)) {
				console.log(data.score);
				// $('#opponentScore #score').text(data.score);
				receiveScore(data.score,'opponentScore');
			};
		});

		socket.on('new words', function(data){
			wordsArray = data;
			gameOn();
		});

		  // Whenever the server emits 'user joined', log it in the chat body
		socket.on('user joined', function (data) {
			console.log('user joined');
		    $(waiting_for).text('Let the games begin!');
		    socket.emit('sortear palavras');
		});

		socket.on('user left', function (data) {
			console.log('user left');
		    $(waiting_for).text(data.username + " left the game, you won");
		});
		
	});