var RemotePlayer = function(index, game, player, startX, startY, username, health){
	
	var x = startX;
	var y = startY;
//	this.playerName = name;
	
//	this.idleStance = "down";
	this.game = game;
	this.health = health;
	this.player = player;
	
	this.gotHit = false;
	
	
	//MW
	this.magicWallAnims = this.game.add.group();
	this.magicWalls = this.game.add.group();
	this.magicWall = false;
	this.magicWallX;
	this.magicWallY;
	this.magicWallAngle;
	this.magicWalls.enableBody = true;
	this.magicWalls.setAll('body.immovable', true);
	
	//HITPOINT
	this.hitPoint = game.add.sprite(this.player.x, this.player.y, 'atkpoint');
	this.hitPoint.anchor.setTo(0.5);
	this.game.physics.arcade.enable(this.hitPoint);
	this.hitPoint.visible = true;		
	
	//SD MOTION
	this.suddenDeaths = this.game.add.group();
	this.suddenDeaths.enableBody = true;
	this.suddenDeaths.setAll('body.immovable', true);
	//SD INDIVIDUAL
	this.suddenDeathStation = game.add.group();
	this.suddenDeathStation.enableBody = true;
	this.suddenDeathStation.setAll('body.immovable', true);
	//SD SOCKET VARIABLES
	this.suddenSocket = false;
	this.suddenTileX;
	this.suddenTileY;
	this.suddenAnimAngle;
	//MISSED SHOTS
	this.poofGroup = this.game.add.group();
	this.poofGroup.enableBody = true;
	this.poofGroup.setAll('body.immovable', true);
	
	
	this.alive = true;
	this.idleStance = "down";
	this.player = game.add.sprite(x,y, 'dude');
	this.healSprites = this.game.add.group(); 
	
	this.player.animations.add('left', [0, 1, 2], 10, true);
  this.player.animations.add('right', [4, 5, 6], 10, true);
  this.player.animations.add('up', [7, 8, 9], 10, true);
  this.player.animations.add('down', [10, 3, 11], 10, true);
	this.player.frame = 3;
	
	this.player.anchor.setTo(0.5,0.5);
	
	this.player.name = index.toString();
	this.player.heal = false;
	this.player.username = username;
	game.physics.enable(this.player, Phaser.Physics.ARCADE);
	this.player.body.immovable = true;
	this.player.body.collideWorldBounds = true;
	
	
	this.cursors = game.input.keyboard.createCursorKeys();
	
	//HEALTHBAR
	var barConfig = {
		x: 615,
		y: 785,
		width: 50,
		height: 5
	};
	this.healthBar = new HealthBar(this.game, barConfig);
	
	
	
	
	this.lastPosition = {x: x, y: y};
	
	
	this.style = {
	
		font: '15px Arial',
	
		fill: '#fff'
	
	};
	
	
	this.remoteText = this.game.add.text(0,0, this.player.username, this.style);
	this.remoteText.anchor.setTo(0.5);
	
	
	
}

RemotePlayer.prototype = Object.create(Phaser.Sprite.prototype);
RemotePlayer.prototype.constructor = RemotePlayer;

RemotePlayer.prototype.update = function () {	
	
	
	
	this.remoteText.x = Math.floor(this.player.x);
	this.remoteText.y = Math.floor(this.player.y - 35);
	
	game.world.bringToTop(this.suddenDeathStation);
	
	//HITPOINT
	//Set hitPoint to Player
	this.hitPoint.x = this.player.x;
	this.hitPoint.y = this.player.y;
	
	
	//MagicWall
	if(this.magicWall){
		var myMagicWall = this.magicWallAnims.getFirstExists(false);
		
		if(!myMagicWall){
			myMagicWall = this.magicWallAnims.create(this.player.x, this.player.y, 'magicspell');
		};
		
		myMagicWall.reset(this.player.x, this.player.y);
		myMagicWall.angle = this.magicWallAngle;
		myMagicWall.anchor.setTo(0.5);
		myMagicWall.animations.add("magicAnim", [0,1,2,0], true);
		
		var magicMovement = this.game.add.tween(myMagicWall);
		
		magicMovement.to({x: this.magicWallX, y: this.magicWallY}, 200);
		magicMovement.onComplete.add(function(){
			var singleMagicWall = this.magicWalls.getFirstExists(false);
			
			if(!singleMagicWall){
				singleMagicWall = this.magicWalls.create(this.magicWallX, this.magicWallY, 'magicwall');
			};
				
			singleMagicWall.anchor.setTo(0.5);
			singleMagicWall.reset(this.magicWallX, this.magicWallY);
			singleMagicWall.body.immovable = true;
			setTimeout(function(){
				singleMagicWall.kill();
			}, 30000);
			
			myMagicWall.kill();
			
		}, this);
		
		magicMovement.start();
		myMagicWall.animations.play('magicAnim');
		
		
		this.magicWall = false;
	};
	
	

	//SUDDEN DEATH
	if(this.suddenSocket){
		var suddenX = this.suddenTileX;
		var suddenY = this.suddenTileY;
		
		var suddenAnim = this.suddenDeaths.getFirstExists(false);
		if(!suddenAnim){
			suddenAnim = this.suddenDeaths.create(this.player.x, this.player.y, 'sdAnim');
		};
		
		suddenAnim.reset(this.player.x, this.player.y);
		suddenAnim.anchor.setTo(0.5);
		suddenAnim.angle = this.suddenAnimAngle;
		//Tween
		var suddenTween = this.game.add.tween(suddenAnim);
		suddenTween.to({
			x: suddenX,
			y: suddenY
		}, 100);
		suddenTween.onComplete.add(function(){
			
			var poof = this.poofGroup.getFirstExists(false);
			if(!poof){
				poof = this.poofGroup.create(this.suddenTileX, this.suddenTileY, 'poof');
				poof.anchor.setTo(0.5);
			};
			
			poof.animations.add('poof', [0,1,2,3,4,5,6,7,8], 10, false);
			poof.reset(this.suddenTileX, this.suddenTileY);
			poof.animations.play('poof');
			poof.animations.currentAnim.onComplete.add(function(){
				poof.kill();
			});
			
			suddenAnim.kill();
		}, this);
		
		suddenTween.start();
		//This make sure this function doesn't get updated every millisecond...lol
		this.suddenSocket = false;
		
	};
	
	//SUDDEN DEATH WHEN ATTCKED
		if(this.gotHit){
			//IF CLIENT KILLED A REMOTE PLAYER
			if(this.health == 0){
				socket.emit('Killed Someone',{
					victim: this.player.username,
					killer: currentPlayerName
				});
				killCount++;
				this.health = 1;
			};
			console.log("You just hit someone" + this.player.username);
			var  mySudden = this.suddenDeathStation.getFirstExists(false);
			if(!mySudden){
				mySudden = this.suddenDeathStation.create(this.player.x, this.player.y, 'sd');
				mySudden.anchor.setTo(0.5);
			};
			
			mySudden.animations.add('sd', [0,1,2,3,4,5,6,7,8,9,10,11], 20, false);
			mySudden.reset(this.player.x, this.player.y);
			mySudden.animations.play('sd');
			mySudden.animations.currentAnim.onComplete.add(function(){	
				mySudden.kill();
				//		suddenCheck = 0;
			});
			this.gotHit = false;
		}


	
	//HEALTHBAR
	this.healthBar.setPosition(this.player.x, this.player.y - 25);
	if(this.health < 0){
		this.health = 0;
	};
	if(this.health > 100){
		this.health = 100;
	};
	this.healthBar.setPercent(this.health);
	
	//HEAL PLAYER
	if(this.player.heal){
		var healSprite = this.healSprites.getFirstExists(false);
		
		if(!healSprite){
			healSprite = this.healSprites.create(this.player.x, this.player.y, 'healspell');
		};
		healSprite.reset(this.player.x, this.player.y);
		healSprite.anchor.setTo(0.5);
		healSprite.animations.add('MyHeal', [0, 1, 2,1], 10, false);
		healSprite.animations.play('MyHeal');
		healSprite.animations.currentAnim.onComplete.add(function(){
			healSprite.kill();
		}, this);
		this.player.heal = false;
	};

	//LEFT
	if(this.lastPosition.x > this.player.x){
		this.player.animations.play("left");
		this.idleStance = "left";
	}
	//RIGHT
	else if(this.lastPosition.x < this.player.x){
		this.player.animations.play("right");
		this.idleStance = "right";
	}
	//UP
	else if(this.lastPosition.y > this.player.y){
		this.player.animations.play("up");
		this.idleStance = "up";
	}
	//DOWN
	else if(this.lastPosition.y < this.player.y){
		this.player.animations.play("down");
		this.idleStance = "down"
	}
	//IDLE
	else{
    this.player.animations.stop();
    switch (this.idleStance) {
      case "left":
        this.player.frame = 1;
        break;
      case "right":
        this.player.frame = 5;
        break;
      case "down":
        this.player.frame = 3;
        break;
      case "up":
        this.player.frame = 8;
        break;
    }		
	}
	
	
  this.lastPosition.x = this.player.x;
  this.lastPosition.y = this.player.y;	
}




window.RemotePlayer = RemotePlayer