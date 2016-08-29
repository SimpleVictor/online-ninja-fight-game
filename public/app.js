(function(){
	
	angular.module('myApp', ['btford.socket-io'])
	.controller({MainCtrl:MainCtrl});
	
	MainCtrl.$inject = ['$scope','Socket','$document'];
	
	function MainCtrl($scope,Socket,$document){
	var vm = this;	
	vm.users = [];	
	vm.messages = [];	
	//ChatBox Scrolling bottom
vm.updateScroll = function (){
    var element = document.getElementById("msgList");
    element.scrollTop = element.scrollHeight;
}		
		
	//
	//CUSTOM FUNCTIONS
	//
		
		
		
    var promptUsername = function(message){
				bootbox.prompt(message, function(name){
					if(name != null){
						//For some reason It needs to be different? Before it gets mix up...idk...
						currentPlayerName = name;
						Socket.emit('add-user', {username: name});
						socket.emit('new player', {x: player.x, y: player.y, username: name});
					}else{
						promptUsername('You must enter a username!');
					};
				});
		};		

		
		
		//Send Button
		vm.sendMessage = function(msg){
			if(msg != null && msg != ''){
				//send to server your msg to display to everybody
				Socket.emit('message', {message:msg});
				//clear input field
				vm.myMessage = '';
			};
		};
		
		
		//GET MESSAGE FROM SERVERSIDE
		Socket.on('message', function(data){
			vm.messages.push(data);
			vm.updateScroll();
		});
		
		//Start the modal at start
		promptUsername("Please Enter A Name");
		
		
		//GET ALL USER THAT IS ALREADY CONNECTED
		Socket.emit('request-users',{});
		
		//GETTING ALL USER ARRAY FROM SERVER
		Socket.on('users', function(data){
			vm.users = data.users;
			console.log(vm.users);
		});
		
		//PUSH DATA ONTO ARRAY SET UP IN THE BEGINNING
		Socket.on('add-user', function(data){
			vm.users.push(data.username);
			vm.messages.push({username: data.username, message: ' has entered the chat'});
			vm.updateScroll();
		});
		
		//WHEN A USERNAME CAME BACK NEGATIVE BECAUSE OF THE SAME NAME
		Socket.on('prompt-username', function(msg){
			promptUsername(msg.message);
		});
		
		//WHEN THE USER LEAVES THE PAGES
		$scope.$on('$locationChangeStart', function(){
			Socket.disconnect(true);
		});
		
		
		//THIS TAKES OUT THE USER THAT LEFT THE CHAT AND SPLICE IT OUT OF THE ARRAY
		Socket.on('remove-user', function(data){
			console.log(data.username);
			vm.messages.push({username: data.username, message: ' has left the chat room'});
			vm.users.splice(vm.users.indexOf(data.username),1);
			vm.updateScroll();
		});		
		

	}
	
})();