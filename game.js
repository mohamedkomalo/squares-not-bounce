var KEYCODES_ARROWS_UP = 38;
var KEYCODES_ARROWS_DOWN = 40;
var KEYCODES_SPACE = 32;

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var GameController = (function(){
	var GAME_SIZE = {width:700, height: 500};
	var GAME_SCALE = 30;
	var GAME_GRAVITY = 9.8;
	var GAME_END = false;

	var levels = [{
		ball:{
			pos:{},
			radius:1,
			color: 'black'
		},
		bricks:[{
			pos:{},
			size:{},
			rotation:10
		}]
	}];
	
	var nextLevelIndex = 0;
	
	var failTrials = 0;
	var startTime;
	var endTime;

	var canvas = document.getElementById('game');

	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var worldConfig = {
		scale: GAME_SCALE,
		tickFrequency: 50,
		gravity: {x:0, y:GAME_GRAVITY}
	};
	var world = boxbox.createWorld(canvas, worldConfig);

	var createBorders = function(){
		world.camera({x:0, y:0});
		// var boundaryTemplate = {
		// 	name: 'boundary',
		// 	shape: 'square',
		// 	color: 'black',
		// 	borderColor: 'black',
		// 	type: 'static',
		// 	width:GAME_SIZE.width / GAME_SCALE,
		// 	height:GAME_SIZE.height / GAME_SCALE
		// };

		// var bottomBoundary = world.createEntity(boundaryTemplate, { height: 0.1, y: 0 + 0.1 });
		// var leftBoundary = world.createEntity(boundaryTemplate, { width: 0.1, x: 0 + 0.1 });
		// var rightBoundary = world.createEntity(boundaryTemplate, { width: 2, x: 70.5 });
		// var bottomBoundary = world.createEntity(boundaryTemplate, { height: 2, y: 50.5 });

		// var width = GAME_SIZE.width / GAME_SCALE;
		// var height = GAME_SIZE.height / GAME_SCALE;
		// console.log(width);

		// var wall = world.createEntity({
		// 	name: 'wall',
		// 	shape: 'polygon',
		// 	type: 'static',
		// 	color: 'transparent',
		// 	x:0, 
		// 	y:0,
		// 	points: [{ x: 0, y: 0 }, 
		// 			{ x: 0, y: height },
		// 			{ x: width, y: height }, 
		// 			{ x: width, y: 0 } ]
		// });
	}

	var createLineCarry = function(config){
		var lineTemplate = {
			name: 'line',
			type: 'static',
			x: 0,
			y: 0,

		};
	}


	var createNewLevel = function(level){
		startTime = new Date().getTime();

		createBorders();

		var ballTemplate = {
			name: 'ball',
			shape: 'circle',
			color: 'white',
			radius: 0.5
		};

		var ball = world.createEntity(ballTemplate);

		var ballHolder = {
			name: 'ballHolder', 
			shape: 'square',
			color: 'green',
			type: 'static',
			x: ball.position().x, 
			y: ball.position().y + ballTemplate.radius + 0.1,
			rotation: 45,
			width: ballTemplate.radius,
			height: 0.1
		};

		var lineTemplate = {
			name: 'line',
			shape: 'polygon', 
			color: 'darkblue',
			type: 'static',
			borderWidth: 5,
			$isInsideNow: false,
			onMousedown: function(){
				//this.roation(this.rotation() + 5);
			}
		}

		var ballHolder = world.createEntity(ballHolder);

		var newLineTemplate = {
			name: 'bomba',
			shape: 'square',
			x:6, 
			y:5,
			width: 3,
			height: 0.5,
			onTick: function(){
				//this.rotation(this.rotation() + this.$add);
			}
		};

		var k = world.createEntity(newLineTemplate);
		
		var bomba = function(){
			k.applyImpulse(50, 0);
			setTimeout(bomba, 1000);
		}
		setTimeout(bomba, 1000);
		//k.setForce('komalo', 50, 1);

		world.createEntity(newLineTemplate, {x: 5, y: 9, rotation: Math.random() * 360, $add: -10});
		world.createEntity(newLineTemplate, {x: 10, y: 10, rotation: Math.random() * 360, $add: +10});

		var start = {x:0, y:0};
		// world.onMousedown(function(event, mouseInfo){
		// 	var m = mouseInfo;//world.calculateWorldPositionFromPointer(event);
		// 	start.x = m.x;
		// 	start.y = m.y;
		// });
			
		world.pause();


		// setTimeout(function(){
		// 	world.pause();
		// 	console.log('a');
		// 	ballHolder.destroy();
		// }, 1000);

		//world.camera({x:0, y:0});
		// world.onMouseup(function(event, mouseInfo){
		// 	var m = mouseInfo;
		// 	//var o = world.calculateWorldPositionFromPointer(event);
		// 	var width  = Math.abs(start.x - m.x);
		// 	var height = Math.abs(start.y - m.y);

		// 	console.log(start);
		// 	console.log(m);

		// 	// world.createEntity({
		// 	// 	name:'komalo',
		// 	// 	type:'square',
		// 	// 	x: m.x,
		// 	// 	y: m.y
		// 	// });

		// 	world.createEntity(lineTemplate, { 
		// 		x: 0,
		// 		y: 0,
		// 		points :[{
		// 			x: start.x,
		// 			y: start.y
		// 		},{
		// 			x: m.x,
		// 			y: m.y}]
		// 		});
		// });
		
		//  var komalo = {x:1, y:1};

		// world.onMousemove(function(event, mouseInfo){
		// 	//var m = mouseInfo;
		// 	komalo.x = event.clientX;
		// 	komalo.y = event.clientY;
		// 	console.log(komalo);
		// });

		// world.onRender(function(cx){
		// 	cx.fillStyle = "black";
		// 	cx.fillRect(komalo.x, komalo.y, 10, 10);

		// });
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

	world.onRender(function(context){
		context.fillStyle = "black";
		context.font="13px Verdana";
		var trials = getFailTrials();
		var elapsedTime = getElapsedTime();

		context.fillStyle="darkgrey";

		var infoX = 5;
		var infoY = 14;
		context.fillText("Time Elapsed: " + elapsedTime, infoX, infoY);
		context.fillText("Failed Trials: " + trials, infoX, infoY + 20);
		context.fillText("Level " + nextLevelIndex + ": " + level.name, infoX, infoY + 40);

		if(GAME_END){
			context.fillStyle="rgba(0,0,0,0.7)";
			context.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);

			context.fillStyle = "white";
			context.font="23px Verdana";
			var x = GAME_SIZE.width/2 - 230;
			var y = GAME_SIZE.height/2 - 60;
			context.fillText("Congratualations, you have successfully", x, y);
			context.fillText('finished all the levels within time: ' + elapsedTime, x, y + 30);
			context.fillText('and fail trials: ' + trials, x, y + 60);
		}
	});

	moveToNextLevel();
	
	world.pause();

	return {
		startGame: function(){
			world.pause();
		}
	};
})();

// Disable space scroll
window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
};