/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (startX, startY) {
  var x = startX
  var y = startY
  var id
	var name
	var killCount = 0;
	var healthbar;

  // Getters and setters
  var getX = function () {
    return x
  }

  var getY = function () {
    return y
  }
	
	var getHealth = function(){
		return healthbar;
	}
	
	var getKillCount = function(){
		return killCount;	
	}
	
	var setKillCount = function(){
		killCount++;
	};

	var setHealth = function(newHealth){
		healthbar = newHealth;
	}
	
  var setX = function (newX) {
    x = newX
  }

  var setY = function (newY) {
    y = newY
  }
	


  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
		name: name,
		getHealth: getHealth,
		setHealth: setHealth,
		setKillCount: setKillCount,
		getKillCount: getKillCount,
		id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player
