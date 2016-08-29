var express = require('express');
var socket_io = require('socket.io');
var path = require('path');
var util = require('util');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


var io = socket_io();
app.io = io;

var Player = require('./Player');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/users', users);








//Send this user to the new user to know whose already in the chat
var users = [];
var players = [];



io.on("connection", function( socket ){

	
	//LISTENING TO 'new player'
	socket.on('new player', function(data){
		console.log(data);
		//Create a new player
		var newPlayer = new Player(data.x, data.y);
		//this.id === socket.id (same thing)
		newPlayer.id = this.id;
		newPlayer.name = data.username;
		newPlayer.setHealth(100);
		
		//Broadcast new player to connected socket clients
		this.broadcast.emit('new player', {
			id: newPlayer.id,
			health: newPlayer.getHealth(),
			name: newPlayer.name,
			x: newPlayer.getX(),
			y: newPlayer.getY()
		});
		
		//send existing players to the new player
		var i, existingPlayer;
		for(i = 0; i < players.length;i++){
			existingPlayer = players[i];
			this.emit('new player', {
				name: existingPlayer.name,
				id: existingPlayer.id,
				x: existingPlayer.getX(),
				y: existingPlayer.getY(),
				health: existingPlayer.getHealth()
			});
		};
		
		//add new player to the players array
		players.push(newPlayer);
//		console.log(players);
		
	});
	//LISTENING TO 'move player'
	socket.on('move player', function(data){
		//Find the player in array
		var movePlayer = playerById(this.id);
		
		//Player not found
		if(!movePlayer){
			util.log('Player not found ' + this.id);
			return;
		};
		
		//update the player[id] new position
		//its specific depending on the new user
		movePlayer.setX(data.x);
		movePlayer.setY(data.y);
		
		//Broadcast updated position to connected socket clients
		this.broadcast.emit('move player', {
			id: movePlayer.id,
			x: movePlayer.getX(),
			y: movePlayer.getY()
		});
		
		
	});
	
	//LISTENING TO HEALING SPELL
		socket.on('heal player', function(data){
			var healPlayer = playerById(this.id);
			
			if(!healPlayer){
				util.log('Player not found ' + this.id);
				return;
			}
			
			healPlayer.setHealth(data.health);
			this.broadcast.emit('heal player',{
				id: healPlayer.id,
				health: healPlayer.getHealth()
			});
		});
	
	
	//DECREASE HEALTH
	socket.on('decrease health', function(data){
		
		var decreasePlayerHealth = playerById(this.id);
		if(!decreasePlayerHealth){
			util.log('Player not found ' + this.id);
			return;			
		};
		decreasePlayerHealth.setHealth(data.health);
		this.broadcast.emit("decrease health", {
			health: decreasePlayerHealth.getHealth(),
			id: decreasePlayerHealth.id
		});
		
	})
	
	//SEND MAGICWALL INFO
	socket.on('send magicwall', function(data){
		
		var magicWall = playerById(this.id);
		if(!magicWall){
			util.log('Player not found ' + this.id);
			return;				
		};
		this.broadcast.emit("send magicwall",{
			id: magicWall.id,
			x: data.x,
			y: data.y,
			angle: data.angle
		});
		
	});
	
	//SEND SD
	socket.on('send sd', function(data){
		
		var suddenDeath = playerById(this.id);
		if(!suddenDeath){
			util.log("Player not found " + this.id);
			return;
		};
		this.broadcast.emit("send sd", {
			id: suddenDeath.id,
			x: data.x,
			y: data.y,
			angle: data.angle
		});
		
		
		
	});
	
	//DEAD
	socket.on('I Died', function(data){
		console.log(data.msg);
	});
	//Killed Someone
	socket.on('Killed Someone', function(data){
		var killer = playerById(this.id);
		if(!killer){
			util.log("Player not found " + this.id);
		};
		killer.setKillCount();
		console.log(data.killer + " has killed " + killer.getKillCount() + " in total");
		io.emit('Killed Someone', {
			id: this.id,
			killer: data.killer,
			killCount: killer.getKillCount(),
			victim: data.victim
		});
	})
	
	
	
	
	
	
	
	
	
	//CHATROOM vvvvv
	
	
	
	
	//	console.log(socket);
	//This is unique for every user to makes a connection.
	//This variable becomes different for every user
	//Pretty much this function is for that specific user. Its not shared
	
	//Check if user enter the page
  console.log( "A user connected with the id of "+ socket.id);
	
	
	var username = "";
	
	//Client is asking for all users. Send back the array that we made
	socket.on('request-users', function(){
		socket.emit('users', {users: users});
	});
	
	//Adding New Users
	socket.on('add-user', function(data){
		//The expression means that theres no connected with the same name
		if(users.indexOf(data.username) == -1){
			username = data.username;
			io.emit('add-user',{username: username});
			io.emit('get name', {username: username});
			users.push(data.username);
			console.log(data.username + " has joined the chat");
		}else{
			console.log("naaaah son");
			socket.emit('prompt-username', {message: 'User already exists!'});
		};
	});
	
	//Send your message to everybody who is connected with io.emit
	socket.on('message', function(data){
		io.emit('phaser message',{
			id: this.id,
			message: data.message
		});
		io.emit('message', {
			username: username,	//Grabbing the variable at the top that was set when user signed up
			message: data.message
		});
	});
	
	//Take out user from array and from the global io
	socket.on('disconnect', function(){
		console.log(username + " has disconnected");
		var removePlayer = playerById(this.id);
		
		//player not found
		if(!removePlayer){
			util.log('Player not found '+ this.id);
			return;
		};
		
		//Remove player from players array
		io.emit('remove-user', {username: username});
		this.broadcast.emit('remove player',{id: this.id});
		players.splice(players.indexOf(removePlayer), 1);
		users.splice(users.indexOf(username),1);
	});
	
	
});














// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}


module.exports = app;
