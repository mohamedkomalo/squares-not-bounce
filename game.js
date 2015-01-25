var KEYCODES_ARROWS_UP = 38;
var KEYCODES_ARROWS_LEFT = 37;
var KEYCODES_ARROWS_RIGHT = 39;
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
			density: 4,
			impulse: 100,
			color: 'grey'
		},
		targets: [{
			width: 0.5,
			height: 0.5,
			x: 40,
			y: 0
		},{
			width: 2,
			height: 2,
			x: 20,
			y: 0
		}],
		lifters:[{
			x:15,
			y:10,
			width: 10,
			height: 2,
			incUp: 1,
			incDown: 20,
			speed: 10
		},{
			x:30,
			y:40,
			width: 15,
			height: 2,
			incUp: 20,
			incDown: 2,
			speed: 5
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
			$cur: 0.3,
			color: 'green'
		});

		var interval = lifterConfig.speed;

		function moveAA(){
			var entity = lifter;
			var pos = entity.position();
			entity.position({x: pos.x, y: pos.y + entity.$cur});

			if(pos.y < (entity.$initialY - entity.$incUp)){
				entity.$cur = Math.abs(entity.$cur);
			}
			else if(pos.y > (entity.$initialY + entity.$incDown)){
				entity.$cur = Math.abs(entity.$cur) * -1;
			}
			setTimeout(moveAA, interval);

		}
		setTimeout(moveAA, interval);

	};

	function createBall(ballConfig){
		var ballTemplate = {
			name: 'ball',
			shape: 'circle',
			color: 'lightblue',
			radius: ballConfig.radius,
			density: ballConfig.density,
			onKeyDown: function(event){
				//console.log(event);
				if(!event.repeat){
					if(event.keyCode === KEYCODES_ARROWS_RIGHT){
						this.applyImpulse(ballConfig.impulse, 90);
					}
					else if(event.keyCode === KEYCODES_ARROWS_LEFT){
						this.applyImpulse(ballConfig.impulse, 270);
					}
				}
			}
		};


		var ball = world.createEntity(ballTemplate);

		var ballHolder = {
			name: 'ballHolder', 
			shape: 'square',
			color: 'green',
			type: 'static',
			x: ball.position().x, 
			y: ball.position().y + ballTemplate.radius + 0.1,
			width: ballTemplate.radius * 2,
			height: 0.1
		};

		world.createEntity(ballHolder);
	};

	function createTarget(targetConfig){
		world.createEntity({
			name: 'ball',
			shape: 'square',
			width: targetConfig.width,
			height: targetConfig.height,
			x: targetConfig.x + targetConfig.width / 2,
			y: targetConfig.y + targetConfig.height / 2,
			onImpact: function(entity){
				if(entity.name == 'ball'){
					needMoveToNextLevel = true;
					//moveToNextLevel();
				}
			}
		});

	};

	function createNewLevel(level){
		needRestartLevel = false;
		needMoveToNextLevel = false;

		createBall(level.ball);

		var targets = level.targets;
		for(var i=0; i<targets.length; i++){
			createTarget(targets[i]);
		}

		var lifters = level.lifters;
		for(var i=0; i<lifters.length; i++){
			createLifter(lifters[i]);
		}
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

	world.pause();

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