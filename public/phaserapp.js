	
//PHASER
//	var game = new Phaser.Game(675,400,Phaser.AUTO, "mygame", { preload: preload, create: create, update: update, render: render });
	var game = new Phaser.Game(900, 900,Phaser.AUTO, "mygame", { preload: preload, create: create, update: update, render: render });
//	var game = new Phaser.Game(800,'99%',Phaser.AUTO, "mygame", { preload: preload, create: create, update: update, render: render });
//	var game = new Phaser.Game(document.window.width,document.window.height,Phaser.AUTO, "mygame", { preload: preload, create: create, update: update, render: render });
	
		
	//
	//PHASER FUNCTIONS
	//
	function preload(){
		
		game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.parentIsWindow = true;
		game.scale.compatibility.forceMinimumDocumentHeight = true;
		game.scale.forceLandscape = true
		
//		game.load.tilemap('map', 'assets/images/40x40/maptile.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.tilemap('map', 'assets/images/40x40/newMap.json', null, Phaser.Tilemap.TILED_JSON);
//		game.load.image('mytile', 'assets/images/40x40/custome.png');
		game.load.image('myTile', 'assets/images/40x40/custome.png');
		game.load.image('magicwall', 'assets/images/40x40/icewall.png');
		game.load.spritesheet('atkpoint', 'assets/images/40x40/attackpoint.png');
		game.load.spritesheet('poof', 'assets/images/40x40/Poof_Effect32x32.png', 32,32);
		game.load.spritesheet('sd', 'assets/images/40x40/Death_Effect32x32.png', 32,32);
		game.load.image('sdAnim', 'assets/images/40x40/suddenDeathAnim.png');
		game.load.spritesheet('dude', 'assets/images/40x40/dude40x40.png', 40, 40);
		game.load.spritesheet('buttonA', 'assets/images/buttons/buttonA.png', 140, 140);
		game.load.spritesheet('buttonB', 'assets/images/buttons/buttonB.png', 140, 140);
		game.load.spritesheet('buttonC', 'assets/images/buttons/buttonC.png', 140, 140);
		game.load.spritesheet('healspell', 'assets/images/spells/healing32x32.png', 32, 32);
		game.load.spritesheet('magicspell', 'assets/images/40x40/blueattack70x32.png', 70, 32);
		game.load.spritesheet('sdParticle', 'assets/images/40x40/sdParticle.png');
		game.load.spritesheet('deadParticle', 'assets/images/40x40/deadParticle.png');
		game.load.image('deadBody', 'assets/images/40x40/deadbody.png');
		game.load.spritesheet('deadMessage', 'assets/images/40x40/youredead.png',518,116);
		
		
		//Do we need this?
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
//		Phaser.Tilemap.setTileSize(48,48);
		
		
	};
		
	var player;
	var enemies;
	var cursors;
	var newPlayer = false;
	var checkPlayerMovement = true;
	var idleStance = "down";
	var currentPlayerName;
	var waitNewName = false;
	var buttonA;
	var buttonB;
	var buttonC;
	var healSprites;
	var layer;
	var map;
	var marker;
	var setHealingEmit = false;
	var magicwalls;
	var magicAnimations;
	var myHealthBar;
	var healthValue = 100;
	var hitPoint;
	var controlSD;
	var suddenCheck = false;

	var killCount = 0;
	


	//Set variable for which button is clicked
	var buttonClicked;

	function create(){
		socket = io.connect();
		

//		Phaser.TileMap.
    map = game.add.tilemap('map');

    map.addTilesetImage('myTile');
//    map.addTilesetImage('mytile');
		

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
		layer2 = map.createLayer(1);
    layer2.resizeWorld();
		
		var CollisionData = [21,22,15,16,10,19,13,37,38, 2,32];		
		map.setCollision(CollisionData, true, 1, true);
		game.world.setBounds(0,0);
		
		
		
		//BAse of our player
		player = game.add.sprite(615 , 810, 'dude', 3);
//		game.physics.enable(player, Phaser.Physics.ARCADE);
		game.physics.arcade.enable(player);
		player.anchor.setTo(0.5, 0.5);
		player.animations.add('left', [0, 1, 2], 10, true);
    player.animations.add('right', [4, 5, 6], 10, true);
    player.animations.add('up', [7, 8, 9], 10, true);
    player.animations.add('down', [10, 3, 11], 10, true);			
		player.body.collideWorldBounds = true;
//		player.angle =Math.sin(180) * 100;
//		console.log(Math.sin(564/242) * 100);
//		player.body.allowGravity = true;
//		player.enableBody = true;

		hitPoint = game.add.sprite(player.x, player.y, 'atkpoint');
		hitPoint.anchor.setTo(0.5);
		game.physics.arcade.enable(hitPoint);
		hitPoint.visible = true;	
		
		cursors = game.input.keyboard.createCursorKeys();

		
		//enemie array
		enemies = [];
		
		
		//CAMERA
//		game.camera.setSize(800,700);
		game.camera.follow(player);
		
		//ALL EVENTS
		myEvent();
		myChatEvent();
		
		
		
		//BUTTON A ATTACK
		buttonA = game.add.button(853, 40, 'buttonA', buttonClickedA, this, 0,0,1);
		buttonA.anchor.setTo(0.5);
		buttonA.scale.setTo(0.5);
		buttonA.fixedToCamera = true;
		
		//BUTTON B MAGIC WALL
		buttonB = game.add.button(850, 120, 'buttonB', buttonClickedB, this, 0,0,1);
		buttonB.anchor.setTo(0.5);
		buttonB.scale.setTo(0.5);
		buttonB.fixedToCamera = true;		
	
		//BUTTON C HEAL
		buttonC = game.add.button(853, 200, 'buttonC', buttonClickedC, this, 0,0,1);
		buttonC.anchor.setTo(0.5);
		buttonC.scale.setTo(0.5);
		buttonC.fixedToCamera = true;		
		
		//Make it so Phaser can't change my cursor automatically when hover blah blah
		buttonA.inputEnabled = true;
		buttonA.input.useHandCursor = false;
		
		buttonB.inputEnabled = true;
		buttonB.input.useHandCursor = false;
		
		buttonC.inputEnabled = true;
		buttonC.input.useHandCursor = false;
		
		//GROUP FOR HEALME SPRITES
		healSprites = this.add.group();
		//MAGIC WALL
		magicwalls = game.add.group();
		magicwalls.enableBody = true;
//		magicwalls.setAll('body.enable', true);
		magicwalls.setAll('body.immovable', true);
//		magicwalls.setAll('body.allowGravity', false);
//		magicwalls.setAll('body.moves', false);
		//Magic Wall Moving Animation
		magicAnimations = this.add.group();

		//SUDDEN DEATH Movwement
		suddenDeaths = game.add.group();
		suddenDeaths.enableBody = true;
		suddenDeaths.setAll('body.immovable', true);
		//SUDDEN DEATH STATIOn
		suddenDeathStations = game.add.group();
		//make sure we do this for the group we want the collision/overlap to work
		suddenDeathStations.enableBody = true;
		
		//MISSED SHOT
		poofGroup = game.add.group();
		poofGroup.enableBody = true;
//		poofGroup.setAll('body.immovable', true);
		

		
		
	//FOR THE NAME ON TOP OF SPRITE
	this.style = {
		font: '15px Arial',
		fill: '#fff'
	};
	
	this.nameText = game.add.text(0,0,currentPlayerName, this.style);
	this.nameText.anchor.setTo(0.5);
		
		
	  //  Our painting marker
  marker = game.add.graphics();
//  marker.lineStyle(2, 0xffffff, 1);
  marker.drawRect(0, 0, 40, 40);
  game.input.addMoveCallback(updateMarker, this);
  
	//CLICK EVENT	
//	game.input.onDown.add(getTileProperties, this);	
		
		
		//create instance of healthbar
		var barConfig = {
			x: 615,
			y: 785,
			width: 50,
			height: 5
		};
		myHealthBar = new HealthBar(game, barConfig);
		
		
		
	};



	function DoPlayerDmg(){
		console.log("it works");
	}

	

	//CallBack for button clicks
	function buttonClickedA(){
		$("canvas").css("cursor", "crosshair");
		buttonClicked = "A";
	};
	function buttonClickedB(){
		$("canvas").css("cursor", "crosshair");
		buttonClicked = "B";
	};
	function buttonClickedC(){
//		$("canvas").css("cursor", "crosshair");
		buttonClicked = "C";
	};



		
	function render(){
		
		
	};

	function update(){
		
		//Brings all the sprite on top(MAGIC ONLY) because remotePLayer was created after sprite was made. which cause remote to be on top of the spells
		game.world.bringToTop(player);
		game.world.bringToTop(suddenDeathStations);
		game.world.bringToTop(magicwalls);
		game.world.bringToTop(magicAnimations);
		game.world.bringToTop(suddenDeaths);
		game.world.bringToTop(buttonA);
		game.world.bringToTop(buttonB);
		game.world.bringToTop(buttonC);
		
		//COLLISIONS
		game.physics.arcade.collide(player, magicwalls);
    game.physics.arcade.collide(player, layer2);
		game.physics.arcade.overlap(suddenDeaths, magicwalls, initSuddenParticles);
//		game.physics.arcade.overlap(suddenDeaths, dawg, suddenDeathDmg);
//		game.physics.arcade.overlap(suddenDeathStations, dawg, suddenDeathStationsDmg);
//    game.physics.arcade.collide(player, suddenDeaths, suddenCollide);
		
		
		//Set hitPoint to Player
		hitPoint.x = player.x;
		hitPoint.y = player.y;
		
		//Set HealthBar to location of Sprite
		myHealthBar.setPosition(player.x, player.y - 25);
		
		//Mouse Input For Buttons
		if(game.input.activePointer.isDown && $("canvas").css("cursor") === "crosshair"){
				$("canvas").css("cursor", "default");
				//SUDDEN DEATJ
				if(buttonClicked === "A"){
					initSuddenDeath();
				};
				//MAGIC WALL
				if(buttonClicked === "B"){
					initMagicWall();
					buttonClicked = "none";
				};
		}
		
		if(buttonClicked === "C"){
			createHealing();
			buttonClicked = "none";
		};
		
		
//		console.log(game.input.mousePointer.x);
		
		if(waitNewName){
			this.nameText.setText(currentPlayerName);
			this.nameText.x = Math.floor(player.x);
			this.nameText.y = Math.floor(player.y - 35);
		}
		
		
		
		//Check if dead
		if(healthValue <= 0){
			checkIfDead();
			healthValue += 100;
//			myHealthBar.setPercent(healthValue);
		};
		
		
		

		for(var i = 0; i < enemies.length; i++){
			game.physics.arcade.collide(player, enemies[i].player);
			game.physics.arcade.overlap(enemies[i].suddenDeaths, enemies[i].magicWalls,initSuddenParticles);
			game.physics.arcade.overlap(enemies[i].suddenDeaths, magicwalls, initSuddenParticles);
			game.physics.arcade.overlap(suddenDeaths, enemies[i].magicWalls, initSuddenParticles);
			game.physics.arcade.collide(player, enemies[i].magicWalls);
			game.physics.arcade.overlap(hitPoint, enemies[i].suddenDeaths, suddenDeathDmg, suddenDeathCheck);
			enemies[i].update();
		};
		
		
		

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if(cursors.up.isDown && cursors.left.isDown){
        //  Up key && left key
        player.animations.play('left');
        idleStance = "left";
			player.body.velocity.x = -150;
			player.body.velocity.y = -150;
    }else if(cursors.up.isDown && cursors.right.isDown){
        //  Up key && right key
        player.animations.play('right');
        idleStance = "right";
				player.body.velocity.x = 150;
			player.body.velocity.y = -150;
    }else if(cursors.up.isDown && !cursors.left.isDown && !cursors.right.isDown){
        //  Up key only
        player.animations.play('up');
        idleStance = "up";
			player.body.velocity.y = -150;
    }else if(cursors.down.isDown && cursors.left.isDown){
        //  Down key && left key
        player.animations.play('left');
        idleStance = "left";
			player.body.velocity.x = -150;
			player.body.velocity.y = 150;
    }else if(cursors.down.isDown && cursors.right.isDown){
        // Down key && right key
        player.animations.play('right');
        idleStance = "right";
			player.body.velocity.x = 150;
			player.body.velocity.y = 150;
    }else if( cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown){
        //  Down key only!
        player.animations.play('down');
        idleStance = "down";
			player.body.velocity.y = 150;
    }else if (cursors.left.isDown && !cursors.up.isDown && !cursors.down.isDown){
        //  Move to the left
        player.animations.play('left');
        idleStance = "left";
			player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown){
	    //  Move to the right
	    player.animations.play('right');
       idleStance = "right";
			player.body.velocity.x = 150;
    }else{
      player.animations.stop();
      switch (idleStance) {
        case "left":
          player.frame = 1;
          break;
        case "right":
          player.frame = 5;
          break;
        case "down":
          player.frame = 3;
          break;
        case "up":
          player.frame = 8;
          break;
      }
    }
	
		//This makes it so the new Id is added onto the array before it starts checking on the back end
		if(newPlayer){
			socket.emit('move player',{
				x: player.x,
				y: player.y
			});
		};
		

	};		
	
	function doCollision(){
		console.log("works");
	};

	function moveUser(x, y){
		var playerMovement = this.game.add.tween(this.player);
		playerMovement.to({x: x, y: y}, 100);
		playerMovement.onComplete.add(function(){
			this.checkPlayerMovement = true;
		}, this);
		playerMovement.start();		
	};
		
	function myEvent() {
		// Socket connection successful
		socket.on('connect', onSocketConnected);
	  // Socket disconnection
	  socket.on('disconnect', onSocketDisconnect)
	  // New player message received
	  socket.on('new player', onNewPlayer)
	  // Player move message received
	  socket.on('move player', onMovePlayer)
  	// Player removed message received
  	socket.on('remove player', onRemovePlayer)
		//Player added
//		socket.on('add-user', onNewName)
		socket.on('get name', onNewName)
		//Increase health	
		socket.on('heal player', onHealPlayer)
		//Decrease health
		socket.on('decrease health', onDecreaseHealth)
		//MAGIC WALL
		socket.on('send magicwall', onMagicWall)
		//SUDDEN DEATH
		socket.on('send sd', onSuddenDeath)
		//SOMEONE DIED
		socket.on('Killed Someone', onKilled);
		//Messages
		socket.on('phaser message', onMessage);
		
	
		
	};


	function onNewName(data){
//		currentPlayerName = data.username;
//		console.log(data.username);
		waitNewName = true;
	};


	
	//
	//Socket FUNCTIONS
	//
	//onSocketConnected
	function onSocketConnected(){
		console.log("Connected to socket server");
		enemies.forEach(function(enemy){
			enemy.player.kill();
		});
		enemies = [];
	};
	//onSocketDisconnect
	function onSocketDisconnect(){
		console.log("disconnected");
	};
	//onNewPlayer
	function onNewPlayer(data){
		newPlayer = true;
		console.log("New Player connected: " +data.id);
		//		console.log(data);
  	// Avoid possible duplicate players
  	var duplicate = playerById(data.id)
  	if (duplicate) {
  	  console.log('Duplicate player!')
  	  return
  	};
		//Add new player to the remote players array
		moreEnemies = enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y, data.name, data.health));

	};
	//onMovePlayer
	function onMovePlayer(data){
		//Get the specific user
		var movePlayer = playerById(data.id);
		
		//If player was not found
		if(!movePlayer){
			console.log('Player not found: ', data.id);
			return;
		}
		
		//update Player position
		movePlayer.player.x = data.x;
		movePlayer.player.y = data.y;
		
	};
	//onRemovePlayer
	function onRemovePlayer(data){
		console.log("He left " + data.id);
		var removePlayer = playerById(data.id);
		
		//player not found
		if(!removePlayer){
			console.log("Player not found " + data.id);
			return;
		}
		
		removePlayer.player.kill();
		
		//remove player from array as well
		enemies.splice(enemies.indexOf(removePlayer), 1);
		
	};

	//HEAL PLAYER
	function onHealPlayer(data){
		var healPlayer = playerById(data.id);
		if(!healPlayer){
			console.log("Player not found "+ data.id);
			return;
		};
		
		healPlayer.player.heal = true;
		healPlayer.health = data.health;
		
	};

	//DECREASE HEALTH
	function onDecreaseHealth(data){
		var decreaseHealth = playerById(data.id);
		if(!decreaseHealth){
			console.log("Player not found "+ data.id);
			return;			
		};
		decreaseHealth.gotHit = true;
		decreaseHealth.health = data.health;
	};

	//Magic Wall
	function onMagicWall(data){
		var magicPlayer = playerById(data.id);
		if(!magicPlayer){
			console.log("Player not found "+ data.id);
			return;					
		};
		magicPlayer.magicWall = true;
		magicPlayer.magicWallX = data.x;
		magicPlayer.magicWallY = data.y;
		magicPlayer.magicWallAngle = data.angle;
		
	};
	
	//SUDDEN DEATH
	function onSuddenDeath(data){
		var suddenPlayer = playerById(data.id);
		if(!suddenPlayer){
			console.log("Player not found " +data.id);
			return;
		};
		suddenPlayer.suddenSocket = true;
		suddenPlayer.suddenTileX = data.x;
		suddenPlayer.suddenTileY = data.y;	
		suddenPlayer.suddenAnimAngle = data.angle;
	};

	//SOMEONE DIED
	function onKilled(data){
		var theVictim = playerByName(data.victim);
		if(theVictim){
			console.log(data.killer + " has killed " + data.victim);
			//Display Dead body
			theVictim.player.visible = false;
			var clientDeadBody = game.add.sprite(theVictim.player.x, theVictim.player.y, 'deadBody');
			clientDeadBody.anchor.setTo(0.5);
		}else{
			//MESSSAGE
			var deadMessage = game.add.sprite(450, 225, 'deadMessage', 0);
			deadMessage.anchor.setTo(0.5);
			deadMessage.fixedToCamera = true;
			deadMessage.animations.add('DeadAnimation', null , 2 , true);
			deadMessage.animations.play('DeadAnimation');		
			//DISPLAY DEAD BODY
			var deadBody = game.add.sprite(player.x, player.y, 'deadBody');
			deadBody.anchor.setTo(0.5);
			player.visible = false;
		};
	};
	
	//MESSAGE
	function onMessage(data){
		console.log(data);
		var messageData = playerById(data.id);

		if(messageData){
			console.log("went in here");
			var messageText = game.add.text(messageData.player.x,messageData.player.y, data.message, {
				font: '18px Arial',
				fill: 'yellow'
			});
			messageText.anchor.setTo(0.5);
//			messageText.x = player.x;
//			messageText.y = player.y - 60;
			setTimeout(function(){ 
				messageText.destroy();
			}, 3000);			
		}else{
			var messageText = game.add.text(0,0, data.message, {
				font: '18px Arial',
				fill: 'yellow'
			});
			messageText.anchor.setTo(0.5);
			messageText.x = player.x;
			messageText.y = player.y - 60;
			setTimeout(function(){ 
				messageText.destroy();
			}, 3000);
			
		};
	};
	
		
	
	//FUNCTIONS FOR MAGIC SPELL GROUPS

	function createHealing(){
		var healSprite = healSprites.getFirstExists(false);
		
		if(!healSprite){
			healthValue += 30;
			if(healthValue > 100){
				healthValue = 100;
			};
			socket.emit('heal player', {
				health: healthValue
			});			
			healSprite = healSprites.create(player.x,player.y, 'healspell');
			healSprite.anchor.setTo(0.5);
			healSprite.animations.add('MyHeal', [0, 1, 2,1], 10, false);
			healSprite.animations.play('MyHeal');
			myHealthBar.setPercent(healthValue);				
			healSprite.animations.currentAnim.onComplete.add(function(){
			healSprite.kill();
			}, this);
		}else{
			healthValue += 30;
			if(healthValue > 100){
				healthValue = 100;
			};			
			socket.emit('heal player',{
				health: healthValue
			});
			healSprite.reset(player.x, player.y);
			healSprite.animations.play('MyHeal');
			myHealthBar.setPercent(healthValue);			
			healSprite.animations.currentAnim.onComplete.add(function(){
			healSprite.kill();
			}, this);			
		}
	};

	






//marker
function getTileProperties() {

	
		var x = layer.getTileX(game.input.activePointer.worldX);
    var y = layer.getTileY(game.input.activePointer.worldY);
	
//		console.log(game.input.activePointer.worldX + " , " + game.input.activePointer.worldY);
    var tile = map.getTile(x, y, layer);
  	
	
		console.log(tile);
//		var worldtile = map.getTileWorldXY(200, 200);
//		console.log(worldtile);
//		console.log(layer.x);
//		console.log(layer.y);
	

};


//MAGIC WALL
function initMagicWall(){
	
	var x = layer.getTileX(game.input.activePointer.worldX);
  var y = layer.getTileY(game.input.activePointer.worldY);
	
	var tile = map.getTile(x,y,layer);
	
	
	var getMagicWallA = magicAnimations.getFirstExists(false);
	
	if(!getMagicWallA){
		getMagicWallA = magicAnimations.create(player.x, player.y, 'magicspell');
	}
		
		getMagicWallA.reset(player.x, player.y);
		var angleX = (tile.worldX + 20) - player.x;
		var angleY = player.y - (tile.worldY + 20);
	
//		console.log("angleY: "  + angleY);
		getMagicWallA.angle = Phaser.Math.angleBetween(player.x, player.y, (tile.worldX + 20), (tile.worldY + 20) ) * (180/Math.PI)
		getMagicWallA.anchor.setTo(0.5);
		getMagicWallA.animations.add("magicAnim", [0,1,2,0], 20, true);
		
		socket.emit('send magicwall', {
			x: tile.worldX + 20,
			y: tile.worldY + 20,
			angle: getMagicWallA.angle
		});
	
		//ADD TWEEN FOR THE ANIMATION
		var magicMovement = game.add.tween(getMagicWallA);
		
		magicMovement.to({x: tile.worldX + 20, y: tile.worldY + 20}, 200);
		magicMovement.onComplete.add(function(){
			
			var magicwall = magicwalls.getFirstExists(false);

			if(!magicwall){
				magicwall = magicwalls.create(tile.worldX + 20, tile.worldY + 20, 'magicwall');
				magicwall.anchor.setTo(0.5);
			};

			magicwall.reset(tile.worldX + 20, tile.worldY + 20);
			magicwall.body.immovable = true;
			setTimeout(function(){

				magicwall.kill();

			}, 30000);
			
			getMagicWallA.kill();
			
		}, this);
	
		magicMovement.start();
		getMagicWallA.animations.play('magicAnim');
	
};


function initSuddenDeath(){
	
	var x = layer.getTileX(game.input.activePointer.worldX);
  var y = layer.getTileY(game.input.activePointer.worldY);
	
	var tile = map.getTile(x,y,layer);
	
	suddenDeath = suddenDeaths.getFirstExists(false);
	
	if(!suddenDeath){
		suddenDeath = suddenDeaths.create(player.x, player.y, 'sdAnim');
	};
	
	suddenDeath.reset(player.x, player.y);
	var angleX = (tile.worldX + 20) - player.x;
	var angleY = player.y - (tile.worldY + 20);	
	
	suddenDeath.angle = Phaser.Math.angleBetween(player.x, player.y, (tile.worldX + 20), (tile.worldY + 20) ) * (180/Math.PI);
	suddenDeath.anchor.setTo(0.5);
	
	socket.emit('send sd', {
		x: tile.worldX + 20,
		y: tile.worldY + 20,
		angle: suddenDeath.angle
	});	
	
	var suddenMovement = game.add.tween(suddenDeath);
	
	
	
		suddenMovement.to({x: tile.worldX + 20, y: tile.worldY + 20}, 100);
		suddenMovement.onComplete.add(function(){
			
			var poof = poofGroup.getFirstExists(false);

			if(!poof){
				poof = poofGroup.create(tile.worldX + 20, tile.worldY + 20, 'poof');
			};

			poof.anchor.setTo(0.5);
			poof.animations.add("poof", [0,1,2,3,4,5,6,7,8], 10, false);
				
			poof.reset(tile.worldX + 20, tile.worldY + 20);
//			suddenDeathStation.body.immovable = true;
			poof.animations.play('poof');
			//AFTER ANIMATIONS
			poof.animations.currentAnim.onComplete.add(function(){
				poof.kill();
			});
			
			suddenDeath.kill();
			
		}, this);
		
		suddenMovement.start();	
		
	
	
};


function updateMarker() {

  marker.x = layer.getTileX(game.input.activePointer.worldX) * 40;
  marker.y = layer.getTileY(game.input.activePointer.worldY) * 40;

};

function suddenDeathDmg(){
	console.log("I got hit");
	console.log(healthValue);
	var  mySudden = suddenDeathStations.getFirstExists(false);
	if(!mySudden){
		mySudden = suddenDeathStations.create(player.x, player.y, 'sd');
		mySudden.anchor.setTo(0.5);
	};
	
	healthValue -= 30;
	if(healthValue < 0){
		healthValue = 0;
	};
	myHealthBar.setPercent(healthValue);			
	socket.emit("decrease health", {
		health: healthValue
	});		
	
	mySudden.animations.add('sd', [0,1,2,3,4,5,6,7,8,9,10,11], 20, false);
	mySudden.reset(player.x, player.y);
	mySudden.animations.play('sd');
	mySudden.animations.currentAnim.onComplete.add(function(){
		mySudden.kill();
		suddenCheck = 0;
	});
	
}


function suddenDeathCheck(){
	suddenCheck++;
	if(suddenCheck > 1){
		return false;
	}else{
		return true;
	}
	
}

function initSuddenParticles(first, second){
	var emitter = game.add.emitter(second.x,second.y , 100);
	console.log("burst here");
	console.log(first);
	first.kill();
	
	emitter.makeParticles('sdParticle');
	emitter.minParticleSpeed.setTo(-100,-100);
	emitter.maxParticleSpeed.setTo(100,100);
	emitter.gravity = 0;
	emitter.start(true, 500, null, 100);
};



//	function suddenDeathStationsDmg(){
//		console.log("Hitted him single one");
//	}






function myChatEvent(){
}

function checkIfDead(){
	console.log("You're dead");
//	socket.emit('I Died',{
//		personDead: currentPlayerName,
//		killedby: 
//	});
	
};



function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}

function playerByName(name){
	for(var i = 0; i < enemies.length; i++){
		if(enemies[i].player.username === name){
			return enemies[i]
		};
	};
}











