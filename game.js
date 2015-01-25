var KEYCODES_ARROWS_UP = 38;
var KEYCODES_ARROWS_DOWN = 40;
var KEYCODES_SPACE = 32;

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var GameController = (function(){

	var levels = [{
		name: 'Little',
		ball:{
			x:0,
			y:0,
			radius:1,
			color: 'grey'
		},
		exit: {
			type: 'vert',
			x: 23,
			y: 15
		},
		lifters:[{
			x:0.5,
			y:1,
			width: 5,
			height: 2,
			incUp: 4,
			incDown: 6
		}]
	}];

	var GAME_SIZE = {width:700, height: 500};
	var GAME_SCALE = 10;
	var GAME_END = false;
	
	var nextLevelIndex = 0;
	var needRestartLevel = false;
	var needMoveToNextLevel = false;

	var startTime;
	var endTime;

	var canvas = document.getElementById('game');
	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var worldConfig = {
		scale: GAME_SCALE
	};

	var world = boxbox.createWorld(canvas, worldConfig);

	function createLifter(lifterConfig){
		var lifter = world.createEntity({
			name: 'lifter',
			shape: 'square',
			type: 'static',
			width: lifterConfig.width,
			height: lifterConfig.height,
			x: lifterConfig.x + lifterConfig.width/2,
			y: lifterConfig.y + lifterConfig.height/2,
			$initialY: lifterConfig.y + lifterConfig.height/2,
			$incUp: lifterConfig.incUp,
			$incDown: lifterConfig.incDown,
			$cur: 1,
			color: 'green',
			onTick: function(){
				var pos = this.position();
				this.position({x: pos.x, y: pos.y + this.$cur});

				if(pos.y > this.$initialY + this.$incUp){
					this.$cur *= -1;
				}
				else if(pos.y < this.$initialY + this.$incDown){
					this.$cur *= -1;
				}
			}
		});

		lifter.setVelocity('move', 0.5, 180)
	};

	function createBall(ballConfig){
		world.createEntity({
			name: 'ball',
			shape: 'circle',
			color: 'lightblue',
			radius: ballConfig.radius,
			onkeydown: function(event){
				//var direction = 90 ? event.keyCode === KEYCODES_ARROWS_RIGHT : 270;
				//this.applyImpulse(50, direction);
			}
		});
	};

	function createExit(exitConfig){
		var mwidth = 2;
		var mheight = 2;
		world.createEntity({
			name: 'ball',
			shape: 'square',
			width: mwidth,
			height: mheight,
			x: exitConfig.x + mwidth / 2,
			y: exitConfig.y + mheight / 2,
			onImpact: function(entity){
				if(entity.name == 'ball'){
					moveToNextLevel();
				}
			}
		});

	};

	function createNewLevel(level){
		needRestartLevel = false;
		needMoveToNextLevel = false;

		createBall(level.ball);

		createExit(level.exit);

		var lifters = level.lifters;
		for(var i=0; i<lifters.length; i++){
			createLifter(lifters[i]);
		}

		world.pause();
	};

	function restartLevel(){
		world.pause();
		world.cleanup(worldConfig);
		createNewLevel(levels[nextLevelIndex-1]);
	}

	function moveToNextLevel(){
		if(GAME_END) return;
		if(nextLevelIndex < levels.length){
			world.pause();
			world.cleanup(worldConfig);
			createNewLevel(levels[nextLevelIndex]);
			nextLevelIndex++;
		}
		else{
			endGame();
		}
	}

	function getElapsedTime(){
		if(!startTime)
			return '00:00';
		var myEnd = endTime;
		if(!myEnd){
			myEnd = new Date().getTime();
		}
		var seconds = round(((myEnd - startTime)/1000), 0);
		var minutes = round(((myEnd - startTime)/1000)/60, 0);
		return minutes+':'+seconds;
	}

	function endGame(){
		endTime = new Date().getTime();
		GAME_END = true;
		world.pause();
	}

	function drawScore(context){
		context.fillStyle = "black";
		context.font="13px Verdana";
		var elapsedTime = getElapsedTime();

		context.fillStyle="darkgrey";

		var infoX = 5;
		var infoY = 14;
		context.fillText("Time Elapsed: " + elapsedTime, infoX, infoY);
		context.fillText("Level " + nextLevelIndex + ": " + levels[nextLevelIndex-1].name, infoX, infoY + 20);

		if(GAME_END){
			context.fillStyle="rgba(0,0,0,0.7)";
			context.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);

			context.fillStyle = "white";
			context.font="23px Verdana";
			var x = GAME_SIZE.width/2 - 230;
			var y = GAME_SIZE.height/2 - 60;
			context.fillText("Congratualations, you have successfully", x, y);
			context.fillText('finished all the levels within time: ' + elapsedTime, x, y + 30);
		}
	}

	
	function initWorldFuncs(){
		world.onTick(function(){
			if(needRestartLevel){
				setTimeout(restartLevel(), 10);
			}

			if(needMoveToNextLevel){
				setTimeout(moveToNextLevel(), 10);
			}
		});

		world.onRender(drawScore);
	}


	moveToNextLevel();

	initWorldFuncs();

	return {
		startGame: function(){
			startTime = new Date().getTime();
			world.pause();
		}
	};
})();

// Disable space scroll
window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
};