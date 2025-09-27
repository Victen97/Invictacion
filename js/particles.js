/************* SHIM ************************/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
/********************************************/

// Variables para optimización
var canvas, ctx, height, width, collection = [];
var groundLeaves = []; // Array para hojas en el suelo
var num_drops = 30; // Reducido aún más para mejor rendimiento
var leafCache = null; // Cache para la forma de la hoja
var leafColors = ['#B2663E', '#D4976B', '#C97D4A', '#A85A3B', '#8B4513']; // Colores predefinidos
var gravity = 1;
var windforce = 0;
var windmultiplier = 0.007;
var maxspeed = 5;
var gutter = 0.001;
var groundHeight = 60; // Altura del "suelo" donde se acumulan las hojas

function Drop() {
  this.x;
  this.y;
  this.size;
  this.distance;
  this.color;
  this.speed;
  this.vx;
  this.vy;
  this.rotation;
  this.rotationSpeed;
  this.isGrounded = false;
  this.groundTime = 0;
  this.fadeAlpha = 1;
  this.stackHeight = 0; // Altura en la pila
}

// Función para crear la forma de hoja de arce usando el SVG original
function createLeafShape() {
  if (leafCache) return leafCache;

  // Path data del arce.svg original (escalado y simplificado para mejor rendimiento)
  const svgPathData = `M36 120 c-1 -1 -1 -3 -1 -6 c0 -5 6 -69 8 -81 c2 -10 2 -16 0 -25 c-1 -4 -2 -16 -3 -29 c-3 -36 -7 -67 -11 -87 c-3 -12 -4 -13 -18 -14 c-9 -1 -11 -1 -12 -3 c-2 -3 -1 -11 5 -25 c7 -17 8 -23 9 -38 c1 -24 -3 -33 -18 -36 c-5 -1 -8 -1 -12 0 c-10 2 -14 2 -17 2 c-4 -1 -10 -5 -10 -8 c0 -4 8 -26 15 -39 c6 -11 11 -25 11 -29 c0 -5 -4 -18 -7 -21 c-3 -3 -12 -6 -17 -6 c-2 0 -7 1 -11 2 c-5 1 -10 2 -13 2 c-4 0 -4 0 -5 -3 c-2 -8 3 -21 18 -46 c6 -11 13 -22 15 -26 c6 -15 8 -30 4 -35 c-3 -5 -6 -5 -15 -5 c-14 1 -37 7 -59 17 c-14 6 -23 9 -29 9 c-6 0 -7 -1 -10 -11 c-1 -3 -3 -7 -5 -9 c-5 -6 -21 -12 -45 -17 c-10 -2 -14 -2 -36 -2 c-25 0 -57 2 -75 5 c-13 2 -19 2 -19 0 c-1 -2 3 -9 13 -22 c17 -21 22 -30 36 -55 c4 -8 10 -19 13 -25 c3 -5 10 -20 16 -33 c17 -36 21 -41 31 -44 c8 -3 9 -4 7 -14 c-2 -13 -4 -22 -7 -26 c-2 -2 -3 -5 -3 -6 c0 -4 10 -12 28 -22 c20 -11 22 -13 23 -28 c1 -10 3 -17 8 -26 c6 -12 8 -14 22 -24 c17 -11 27 -20 29 -24 c2 -5 3 -18 2 -28 c-2 -12 -13 -31 -34 -62 c-14 -19 -19 -26 -32 -37 c-11 -9 -13 -12 -11 -18 c2 -6 7 -15 9 -17 c1 -1 4 -2 7 -2 c5 0 20 -2 37 -6 c7 -1 24 -5 38 -7 c45 -8 47 -9 44 -20 c-2 -7 -2 -9 1 -11 c5 -4 8 -4 30 -2 c38 4 46 0 46 -18 c0 -10 -2 -19 -9 -39 c-3 -9 -6 -19 -6 -21 c-1 -4 0 -4 2 -6 c6 -4 21 2 48 19 c25 15 30 18 48 19 c13 1 15 1 17 -4 c2 -4 5 -5 10 -3 c4 2 6 4 30 27 c21 20 39 34 47 37 c2 1 8 2 13 2 c5 1 11 2 12 2 c6 3 22 28 43 68 c17 32 31 51 52 72 c19 19 25 23 47 32 c18 7 18 7 26 7 c6 0 9 -1 11 -2 c5 -3 12 -14 27 -38 c31 -51 44 -82 49 -114 c2 -14 10 -31 18 -42 c3 -4 5 -5 10 -3 c7 3 8 5 8 15 l0 9 -6 3 c-6 3 -11 8 -14 14 c-1 2 -6 16 -11 30 c-15 44 -22 59 -48 102 c-13 20 -18 31 -18 36 c0 4 2 8 8 17 c6 9 9 11 16 13 c12 4 22 5 41 4 c13 0 23 0 35 1 c18 2 22 2 45 -2 c14 -2 23 -2 42 1 c23 3 38 7 62 16 c11 4 22 8 25 9 c3 1 10 2 22 2 c12 0 19 1 25 2 c19 5 34 13 36 20 c1 4 -1 5 -8 9 c-13 5 -15 10 -7 17 c7 7 18 12 43 19 c6 2 14 5 16 6 c5 3 13 11 13 12 c0 1 -3 3 -7 5 c-8 4 -11 9 -11 14 c0 3 1 5 7 12 c11 13 52 51 64 60 c6 5 20 14 31 21 c21 13 26 17 26 20 c0 4 -3 9 -6 10 c-4 1 -24 4 -44 6 c-18 2 -30 4 -55 10 c-10 2 -23 5 -29 6 c-19 4 -22 4 -26 6 c-6 3 -10 6 -12 12 c-3 9 -2 19 4 30 c2 3 8 16 15 27 c14 23 21 37 21 42 c0 4 1 4 -15 2 c-23 -4 -36 -1 -40 9 c-3 6 -1 28 2 39 c11 34 12 43 9 46 c-1 1 -3 2 -7 2 c-9 0 -10 3 -12 20 c-1 13 0 55 2 72 c1 5 1 24 2 42 c1 18 1 36 2 39 l1 6 -7 8 c-4 4 -8 10 -10 13 c-2 3 -5 8 -7 12 l-4 6 -11 -10 c-13 -13 -20 -18 -43 -34 c-20 -14 -28 -19 -36 -26 c-3 -3 -8 -7 -12 -9 c-8 -5 -23 -10 -29 -10 c-4 0 -5 0 -10 6 c-3 3 -6 6 -6 7 c0 1 -1 2 -2 2 c-1 0 -8 -7 -16 -16 c-43 -48 -57 -62 -69 -70 c-6 -4 -12 -5 -18 -4 c-7 1 -18 14 -30 33 c-7 12 -17 34 -25 58 c-4 13 -9 26 -10 28 c-3 7 -8 16 -10 16 c-1 0 -3 -4 -6 -8 c-10 -18 -11 -20 -16 -25 c-5 -6 -10 -8 -15 -8 c-2 0 -7 3 -12 5 c-7 3 -10 6 -14 10 c-5 6 -13 22 -21 41 c-6 14 -10 23 -13 24 c-3 1 -4 0 -13 -10 c-8 -10 -11 -11 -23 -10 c-10 1 -17 4 -41 22 c-10 8 -25 18 -33 24 c-14 10 -22 16 -40 32 c-10 9 -16 14 -33 24 c-30 19 -64 48 -85 73 c-4 5 -10 10 -12 10 c0 0 -1 -1 -2 -1z`;

  leafCache = new Path2D(svgPathData);

  return leafCache;
}

Drop.prototype = {
  constructor: Drop,
  
  random_x: function() {
    var n = width * (1 + gutter);
    return (1 - (1 + gutter)) + (Math.random() * n);
  },
  
  draw: function(ctx) {
    var leafShape = createLeafShape();
    
    ctx.save();
    // Usar fadeAlpha para el efecto de desvanecimiento
    var finalAlpha = ((this.distance + 1) / 12) * this.fadeAlpha;
    ctx.globalAlpha = finalAlpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size/160, this.size/160); // Escalar según el tamaño (reducido a la mitad)
    
    // Rellenar la hoja con color
    ctx.fillStyle = this.color;
    ctx.fill(leafShape);
    
    // Agregar un borde sutil para definición
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
    ctx.lineWidth = 0.5;
    ctx.stroke(leafShape);
    
    ctx.restore();
  }
};

function draw_frame() {
  ctx.clearRect(0, 0, width, height);
  
  // Dibujar hojas en el suelo primero (por debajo de las que caen)
  groundLeaves.forEach(function (leaf) {
    leaf.draw(ctx);
    
    // Actualizar tiempo en el suelo
    leaf.groundTime++;
    
    // Comenzar a desvanecer después de 3 segundos (180 frames a 60fps)
    if (leaf.groundTime > 180) {
      var fadeTime = leaf.groundTime - 180;
      var fadeDuration = 120; // 2 segundos para desvanecerse
      leaf.fadeAlpha = Math.max(0, 1 - (fadeTime / fadeDuration));
    }
  });
  
  // Remover hojas completamente desvanecidas
  groundLeaves = groundLeaves.filter(function(leaf) {
    return leaf.fadeAlpha > 0;
  });
  
  // Dibujar hojas que caen
  collection.forEach(function (drop) {
    if (!drop.isGrounded) {
      drop.draw(ctx);
      drop.x += drop.vx;
      drop.y += drop.vy;
      drop.rotation += drop.rotationSpeed;
      
      var lx = drop.vx + windforce;
      lx < maxspeed && lx > 1 - maxspeed && (drop.vx = lx);
      
      // Verificar si la hoja llegó al suelo
      if (drop.y > height - groundHeight) {
        // Convertir a hoja de suelo
        drop.isGrounded = true;
        drop.groundTime = 0;
        drop.fadeAlpha = 1;
        
        // Calcular posición en la pila
        var groundX = Math.max(drop.size/2, Math.min(width - drop.size/2, drop.x));
        var stackHeight = getStackHeight(groundX);
        
        drop.x = groundX + (Math.random() - 0.5) * 20; // Pequeña variación horizontal
        drop.y = height - groundHeight + stackHeight;
        drop.stackHeight = stackHeight;
        drop.vx = 0;
        drop.vy = 0;
        drop.rotationSpeed *= 0.1; // Reducir rotación
        
        // Agregar a las hojas del suelo
        groundLeaves.push(drop);
        
        // Crear nueva hoja que caiga
        var newDrop = new Drop();
        newDrop.distance = Math.random() * 6 | 0;
        newDrop.speed = Math.random() * (newDrop.distance / 8) + gravity;
        newDrop.vx = Math.random() * 1.5 - 0.75;
        newDrop.vy = Math.random() * newDrop.speed + (newDrop.speed / 2);
        newDrop.size = (newDrop.distance + 1) * 1;
        newDrop.x = newDrop.random_x();
        newDrop.y = Math.random() * -newDrop.size * 3;
        newDrop.rotation = Math.random() * Math.PI * 2;
        newDrop.rotationSpeed = (Math.random() - 0.5) * 0.015;
        newDrop.color = leafColors[Math.floor(Math.random() * leafColors.length)];
        newDrop.isGrounded = false;
        newDrop.groundTime = 0;
        newDrop.fadeAlpha = 1;
        newDrop.stackHeight = 0;
        
        // Reemplazar la hoja actual
        var index = collection.indexOf(drop);
        if (index !== -1) {
          collection[index] = newDrop;
        }
      }
      
      if (drop.x > width * (1 + gutter)) {
        drop.x = 1 - (width * gutter);
      }
      if (drop.x < 1 - (width * gutter)) {
        drop.x = width * (1 + gutter);
      }
    }
  });
}

// Función para calcular la altura de la pila en una posición X
function getStackHeight(x) {
  var height = 0;
  var range = 30; // Rango de influencia para apilar hojas
  
  groundLeaves.forEach(function(leaf) {
    if (Math.abs(leaf.x - x) < range) {
      height -= leaf.size * 0.3; // Las hojas se apilan parcialmente
    }
  });
  
  return height;
}

function animate() {
  requestAnimFrame(animate);
  draw_frame();
}

function windtimer() {
  windforce = Math.random() > 0.5 ? windmultiplier : -windmultiplier;
  setTimeout(windtimer, Math.random() * (1000 * 30));
}

function initParticles() {
  canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  ctx = canvas.getContext('2d');
  
  // Obtener dimensiones del contenedor
  var container = canvas.parentElement;
  height = canvas.height = container.offsetHeight;
  width = canvas.width = container.offsetWidth;
  
  collection = [];
  var drops_to_create = num_drops;
  
  while (drops_to_create--) {
    var drop = new Drop();
    drop.distance = Math.random() * 6 | 0; // Menos niveles de distancia
    drop.speed = Math.random() * (drop.distance / 8) + gravity;
    drop.vx = Math.random() * 1.5 - 0.75; // Movimiento lateral más suave
    drop.vy = Math.random() * drop.speed + (drop.speed / 2);
    drop.size = (drop.distance + 1) * 1; // Tamaños aún más pequeños
    drop.x = drop.random_x();
    drop.y = Math.random() * height;
    drop.rotation = Math.random() * Math.PI * 2;
    drop.rotationSpeed = (Math.random() - 0.5) * 0.015;
    drop.color = leafColors[Math.floor(Math.random() * leafColors.length)]; // Color predefinido
    drop.isGrounded = false;
    drop.groundTime = 0;
    drop.fadeAlpha = 1;
    drop.stackHeight = 0;
    collection.push(drop);
  }
  
  windtimer();
  animate();
  
  // Redimensionar canvas cuando cambie el tamaño
  window.addEventListener('resize', function() {
    if (canvas && canvas.parentElement) {
      height = canvas.height = canvas.parentElement.offsetHeight;
      width = canvas.width = canvas.parentElement.offsetWidth;
    }
  });
}

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para asegurar que todo esté renderizado
  setTimeout(initParticles, 500);
});
