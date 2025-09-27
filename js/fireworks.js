// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// not supported in all browsers though and sometimes needs a prefix, so we need a shim
window.requestAnimFrame = ( function() {
	return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function( callback ) {
					window.setTimeout( callback, 1000 / 60 );
				};
})();

// now we will setup our basic variables for the demo
var fireworksCanvas, fireworksCtx,
		// full screen dimensions
		cw, ch,
		// firework collection
		fireworks = [],
		// particle collection
		particles = [],
		// starting hue
		hue = 120,
		// this will time the auto launches of fireworks, one launch per 80 loop ticks
		timerTotal = 80,
		timerTick = 0;

// now we are going to setup our function placeholders for the entire demo

// get a random number within a range
function random( min, max ) {
	return Math.random() * ( max - min ) + min;
}

// calculate the distance between two points
function calculateDistance( p1x, p1y, p2x, p2y ) {
	var xDistance = p1x - p2x,
			yDistance = p1y - p2y;
	return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
}

// create firework
function Firework( sx, sy, tx, ty ) {
	// actual coordinates
	this.x = sx;
	this.y = sy;
	// starting coordinates
	this.sx = sx;
	this.sy = sy;
	// target coordinates
	this.tx = tx;
	this.ty = ty;
	// distance from starting point to target
	this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
	this.distanceTraveled = 0;
	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 3;
	// populate initial coordinate collection with the current coordinates
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	this.angle = Math.atan2( ty - sy, tx - sx );
	this.speed = 2;
	this.acceleration = 1.05;
	this.brightness = random( 50, 70 );
	// circle target indicator radius
	this.targetRadius = 1;
}

// update firework
Firework.prototype.update = function( index ) {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift( [ this.x, this.y ] );
	
	// cycle the circle target indicator radius
	if( this.targetRadius < 8 ) {
		this.targetRadius += 0.3;
	} else {
		this.targetRadius = 1;
	}
	
	// speed up the firework
	this.speed *= this.acceleration;
	
	// get the current velocities based on angle and speed
	var vx = Math.cos( this.angle ) * this.speed,
			vy = Math.sin( this.angle ) * this.speed;
	// how far will the firework have traveled with velocities applied?
	this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );
	
	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
	if( this.distanceTraveled >= this.distanceToTarget ) {
		createParticles( this.tx, this.ty );
		// remove the firework, use the index passed into the update function to determine which to remove
		fireworks.splice( index, 1 );
	} else {
		// target not reached, keep traveling
		this.x += vx;
		this.y += vy;
	}
}

// draw firework
Firework.prototype.draw = function() {
	fireworksCtx.beginPath();
	// move to the last tracked coordinate in the set, then draw a line to the current x and y
	fireworksCtx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
	fireworksCtx.lineTo( this.x, this.y );
	fireworksCtx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
	fireworksCtx.stroke();
	
	fireworksCtx.beginPath();
	// draw the target for this firework with a pulsing circle
	fireworksCtx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
	fireworksCtx.stroke();
}

// create particle
function Particle( x, y ) {
	this.x = x;
	this.y = y;
	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	// set a random angle in all possible directions, in radians
	this.angle = random( 0, Math.PI * 2 );
	this.speed = random( 1, 10 );
	// friction will slow the particle down
	this.friction = 0.95;
	// gravity will be applied and pull the particle down
	this.gravity = 1;
	// set the hue to a random number +-20 of the overall hue variable
	this.hue = random( hue - 20, hue + 20 );
	this.brightness = random( 50, 80 );
	this.alpha = 1;
	// set how fast the particle fades out
	this.decay = random( 0.015, 0.03 );
}

// update particle
Particle.prototype.update = function( index ) {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift( [ this.x, this.y ] );
	// slow down the particle
	this.speed *= this.friction;
	// apply velocity
	this.x += Math.cos( this.angle ) * this.speed;
	this.y += Math.sin( this.angle ) * this.speed + this.gravity;
	// fade out the particle
	this.alpha -= this.decay;
	
	// remove the particle once the alpha is low enough, based on the passed in index
	if( this.alpha <= this.decay ) {
		particles.splice( index, 1 );
	}
}

// draw particle
Particle.prototype.draw = function() {
	fireworksCtx.beginPath();
	// move to the last tracked coordinates in the set, then draw a line to the current x and y
	fireworksCtx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
	fireworksCtx.lineTo( this.x, this.y );
	fireworksCtx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
	fireworksCtx.stroke();
}

// create particle group/explosion
function createParticles( x, y ) {
	// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
	var particleCount = 30;
	while( particleCount-- ) {
		particles.push( new Particle( x, y ) );
	}
}

// main demo loop
function fireworksLoop() {
	// this function will run endlessly with requestAnimationFrame
	requestAnimFrame( fireworksLoop );
	
	// increase the hue to get different colored fireworks over time
	hue += 0.5;
	
	// normally, clearRect() would be used to clear the canvas
	// we want to create a trailing effect though
	// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
	fireworksCtx.globalCompositeOperation = 'destination-out';
	// decrease the alpha property to create more prominent trails
	fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Usar menor opacidad para fondo blanco
	fireworksCtx.fillRect( 0, 0, cw, ch );
	// change the composite operation back to our main mode
	// lighter creates bright highlight points as the fireworks and particles overlap each other
	fireworksCtx.globalCompositeOperation = 'lighter';
	
	// loop over each firework, draw it, update it
	var i = fireworks.length;
	while( i-- ) {
		fireworks[ i ].draw();
		fireworks[ i ].update( i );
	}
	
	// loop over each particle, draw it, update it
	var i = particles.length;
	while( i-- ) {
		particles[ i ].draw();
		particles[ i ].update( i );
	}
	
	// launch fireworks automatically to random coordinates
	if( timerTick >= timerTotal ) {
		// start the firework at the bottom middle of the screen, then set the random target coordinates
		// Concentrar los fuegos artificiales más hacia el centro
		var centerX = cw / 2;
		var centerY = ch / 2;
		var maxDistanceX = cw * 0.3; // Reducir el rango horizontal al 30% del ancho
		var maxDistanceY = ch * 0.25; // Reducir el rango vertical al 25% de la altura
		
		var targetX = centerX + (Math.random() - 0.5) * 2 * maxDistanceX;
		var targetY = centerY + (Math.random() - 0.5) * 2 * maxDistanceY;
		
		// Asegurar que no se salgan de los límites
		targetX = Math.max(maxDistanceX, Math.min(cw - maxDistanceX, targetX));
		targetY = Math.max(maxDistanceY, Math.min(ch - maxDistanceY, targetY));
		
		fireworks.push( new Firework( cw / 2, ch, targetX, targetY ) );
		timerTick = 0;
	} else {
		timerTick++;
	}
}

// Initialize fireworks
function initFireworks() {
	fireworksCanvas = document.getElementById('fireworks-canvas');
	if (!fireworksCanvas) return;
	
	fireworksCtx = fireworksCanvas.getContext('2d');
	
	// Obtener dimensiones del contenedor
	var container = fireworksCanvas.parentElement;
	ch = fireworksCanvas.height = container.offsetHeight;
	cw = fireworksCanvas.width = container.offsetWidth;
	
	// Redimensionar canvas cuando cambie el tamaño
	window.addEventListener('resize', function() {
		if (fireworksCanvas && fireworksCanvas.parentElement) {
			ch = fireworksCanvas.height = fireworksCanvas.parentElement.offsetHeight;
			cw = fireworksCanvas.width = fireworksCanvas.parentElement.offsetWidth;
		}
	});
	
	// Start the fireworks loop
	fireworksLoop();
}

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
	// Esperar un poco para asegurar que todo esté renderizado
	setTimeout(initFireworks, 500);
});
