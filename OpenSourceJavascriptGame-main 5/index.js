// SETUP
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
canvas.width = 768;
canvas.height = 768;
function clearCanvas() {
	var prevStyle = [context.fillStyle, context.strokeStyle];
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = prevStyle[0];
	context.strokeStyle = prevStyle[1];
}
clearCanvas();

/********************************************************************************************************************************/

// GET USER INPUT

// Change this to initialize the keys needed to start the script
const initializedKeys = [
	"w",
	"W",
	"ArrowUp",
	"s",
	"S",
	"ArrowDown",
	"a",
	"A",
	"ArrowLeft",
	"d",
	"D",
	"ArrowRight",
	" ",
];
var keyState = new Object();
for (var i = 0; i < initializedKeys.length; i++) {
	keyState[initializedKeys[i]] = false;
}
window.addEventListener('keydown', (event) => {
	keyState[event.key] = true;
});
window.addEventListener('keyup', (event) => {
	keyState[event.key] = false;
});

/********************************************************************************************************************************/

// CLASSES
class Point {
	// A basic class to represent cartesian coordinates
	constructor(x, y) {
		if (typeof(x) !== typeof(0) || typeof(y) !== typeof(0)) { throw new Error("Invalid Point"); }
		this.x = x;
		this.y = y;
	}
	// Set the point value
	set(x, y) {
		if (typeof(x) !== typeof(0) || typeof(y) !== typeof(0)) { throw new Error("Invalid Point"); }
		this.x = x;
		this.y = y;
	}
	// Returns a polar form equivalent to to this point
	toVector() {
		return new Vector(Math.sqrt(Math.pow(this.y, 2) + Math.pow(this.x, 2)), Math.atan2(this.y, this.x));
	}
	// Returns a point with a reversed direction but equivalent magnitude
	invert() {
		return new Point(-1 * this.x, -1 * this.y);
	}
	// Returns a point with a magnitude of 1
	normalize() {
		let factor = this.toVector().magnitude;
		return new Point(this.x / factor, this.y / factor);
	}
	// Finds the distance between this point and another
	getDistance(other) {
		if (!(other instanceof Point)) { throw new Error("getDistance must be between two points."); }
		return Math.sqrt(Math.pow(other.y - this.y, 2) + Math.pow(other.x - this.x, 2));
	}
	// Finds the direction to another point from this one
	getDirection(other) {
		if (!(other instanceof Point)) { throw new Error("getDirection must be between two points."); }
		return Math.atan2(other.y - this.y, other.x - this.x);
	}
};

class Vector {
	// A basic class to represent polar coordinates
	constructor(mag, dir) {
		if (typeof(mag) !== typeof(0) || typeof(dir) !== typeof(0)) { throw new Error("Invalid Vector"); }
		this.magnitude = mag;
		this.direction = dir % (2 * Math.PI);
	}
	// Set the vector value
	set(mag, dir) {
		if (typeof(mag) !== typeof(0) || typeof(dir) !== typeof(0)) { throw new Error("Invalid Vector"); }
		this.magnitude = mag;
		this.direction = dir % (2 * Math.PI);
	}
	// Returns a component form equivalent of this vector
	toPoint() {
		return new Point(this.magnitude * Math.cos(this.direction), this.magnitude * Math.sin(this.direction));
	}
	// Returns a vector with a reversed direction
	invert() {
		return new Vector(this.magnitude, this.direction + Math.PI);
	}
	// Returns a vector with a magnitude of 1
	normalize() {
		return new Vector(1, this.direction);
	}
	// Gets the x component  of the vector
	getX() {
		return this.magnitude * Math.cos(this.direction);
	}
	// Gets the y component of the vector
	getY() {
		return this.magnitude * Math.sin(this.direction);
	}
};

class Triangle {
	// A triangle made of points, with some extra functionality
	constructor(point1, point2, point3) {
		if (!(point1 instanceof Point) || !(point2 instanceof Point) || !(point3 instanceof Point)) { throw new Error("Invalid Points"); }
		this.points = [point1, point2, point3];
		this.normals = this.getNormals();
	}
	getNormals() {
		// Find the center to check normals later
		let center = new Point(((this.points[0].x + this.points[1].x + this.points[2].x) / 3), ((this.points[0].y + this.points[1].y + this.points[2].y) / 3));
		// Initialize a normal Array
		var normals = new Array(3);
		// Loop through the points
		for (let i = 0; i < 3; i++) {
			// Find the normal value for each pair of points
			normals[i] = new Vector(1, new Point(this.points[(i + 1) % 3].x - this.points[i].x, this.points[(i + 1) % 3].y - this.points[i].y).getDirection() + (Math.PI / 2));
			// Calculate the inverse to check if the normal is the correct one
			let inverse = normals[i].invert();
			// Actually check the normal
			if (new Point(center.x + normals[i].getX(), center.y + normals[i].getY()).getDistance(center) < new Point(center.x + inverse.getX(), center.y + inverse.getY())) {
				// Replace the current normal with the inverse one if it is found to be incorrect
				normals[i] = inverse;
			}
		}
		// Return the found normals
		return normals;
	}
};

class Hitbox {
	// A list of triangles representing a hitbox, with some other functionality
	constructor(...points) {
		for (let i = 0; i < points.length; i++) {
			if (!(points[i] instanceof Point)) { throw new Error("Hitbox can only be made with points."); }
		}
		this.points = new Array(points.length);
		for (let i = 0; i < points.length; i++) {
			this.points[i] = points[i];
		}
		this.triangles = this.pointsToTriangles(points);
	}
	pointsToTriangles() {
		// Check that we have enough points
		if (this.points.length < 3) { throw new Error ("Insufficient Points"); }
		var active = new Array(this.points.length);
		for (let i = 0; i < this.points.length; i++) {
			active[i] = this.points[i];
		}
		var triangles = new Array();
		var current = 0;
		/*

		TODO IMPLEMENT TRIANGULATION HERE

		*/
		active.splice(current, 1);
	}
};

class Entity {
	// A top-level class which is a superclass of almost everything in the game
	constructor({id, position, orientation, scale, hitbox, sprite}) {
		// The unique ID of a given entity
		this.id = id;
		// The position of the entity in the world (should be undefined if entity is not present in the world, i.e. in inventory)
		this.position = position;
		// The direction the entity, in radians (0 = facing right)
		this.orientation = orientation;
		// The scale of the entity
		this.scale = scale;
		// The hitbox which is used to calculate collision when the position is not undefined (can also be undefined if the entity will never be present in the world or never collided with)
		this.hitbox = hitbox;
		// This is what is drawn when an entity is in the world
		this.sprite = sprite;
		// Log the entity for debugging
		console.log(this);
	}
	// Checks collision
	collidingWith(other) {
		// Error detection
		if (!(other instanceof Entity)) { throw new Error(other + " is not an Entity"); }
		// Base cases where either this or the other entity are not present in the world/collidable
		if (this.position === undefined || other.position === undefined || this.hitbox === undefined || other.hitbox === undefined) {return false}
		/*

		TODO IMPLEMENT SEPARATING AXIS THEOREM COLLISION HERE ON EACH TRIANGLE IN THE HITBOX

		*/
	}
	// Draw the Entity
	draw(context) {
		if (this.position === undefined) { return; }
		context.drawImage(this.sprite.getImage(), this.position.x, this.position.y)
		/*

		TODO ADD A SPRITE CLASS AND ADJUST IMAGE FOR ORIENTATION (SPRITE CLASS ALLOWS FOR ANIMATION)

		*/
	}
	// Draw the hitbox of the entity
	drawHitbox(context) {
		var prevStyle = [context.fillStyle, context.strokeStyle, context.lineWidth];
		context.strokeStyle = "#FF0000";
		context.lineWidth = 2;
		for (let i = 0; i < this.hitbox.points.length; i++) {
			context.beginPath();
			context.moveTo(this.hitbox.points[i].x + this.position.x, this.hitbox.points[i].y + this.position.y);
			context.lineTo(this.hitbox.points[(i + 1) % this.hitbox.points.length].x + this.position.x, this.hitbox.points[(i + 1) % this.hitbox.points.length].y + this.position.y);
			context.stroke();
		}
		context.fillStyle = prevStyle[0];
		context.strokeStyle = prevStyle[1];
		context.lineWidth = prevStyle[2];
	}
	// Update the entity according to a set of rules
	update({canvas, context}) {
		this.drawHitbox(context);
	}
};

class Player extends Entity {
	constructor(args) {
		super(args);
		this.velocity = new Point(0, 0);
		this.cooldown = 0;
		this.projectile = -1;
	}
	update({keyState, canvas, context, entities}) {
		var up = (keyState["w"] || keyState ["W"] || keyState["ArrowUp"]);
		var down = (keyState["s"] || keyState ["S"] || keyState["ArrowDown"]);
		var left = (keyState["a"] || keyState ["A"] || keyState["ArrowLeft"]);
		var right = (keyState["d"] || keyState ["D"] || keyState["ArrowRight"]);
		if (up && down) {
			up = false;
			down = false;
		}
		if (left && right) {
			left = false;
			right = false;
		}
		if (up) {
			if (right) {
				this.velocity.x = 2.121;
				this.velocity.y = -2.121;
			} else if (left) {
				this.velocity.x = -2.121;
				this.velocity.y = -2.121;
			} else {
				this.velocity.x = 0;
				this.velocity.y = -3;
			}
		} else if (down) {
			if (right) {
				this.velocity.x = 2.121;
				this.velocity.y = 2.121;
			} else if (left) {
				this.velocity.x = -2.121;
				this.velocity.y = 2.121;
			} else {
				this.velocity.x = 0;
				this.velocity.y = 3;
			}
		} else if (left) {
			this.velocity.x = -3;
			this.velocity.y = 0;
		} else if (right) {
			this.velocity.x = 3;
			this.velocity.y = 0;
		} else {
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		if (keyState[" "] && this.cooldown === 0) {
		    this.cooldown = 64
            entities.push(new Projectile({id: "projectile", position: new Point(this.position.x, this.position.y), orientation: this.orientation, scale: this.scale}))
            this.projectile = entities.length - 1;
		}
		if (this.cooldown > 0) {
		    this.cooldown--;
		}
		if (this.cooldown === 0 && this.projectile !== -1) {
		    entities.splice(this.projectile, 1);
		    this.projectile = -1;
		}
		this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
		this.orientation = this.position.getDirection(mousePos);
		this.drawHitbox(context);

		var prevStyle = [context.fillStyle, context.strokeStyle, context.lineWidth];
        context.strokeStyle = "#00FF00";
        context.lineWidth = 2;
        context.arc(this.position.x, this.position.y, 64 * 5 * this.scale, 0, 2 * Math.PI);
        context.fillStyle = prevStyle[0];
        context.strokeStyle = prevStyle[1];
        context.lineWidth = prevStyle[2];
	}
};

class Projectile extends Entity {
    constructor(args) {
        args.hitbox = new Hitbox(new Point(-5, 0), new Point(0, 5), new Point(5, 0), new Point(0, -5));
        super(args);
    }
    update({canvas, context}) {
        let new_position = new Vector(1, this.orientation).toPoint();
        this.position.set(this.position.x + (new_position.x * 5 * this.scale), this.position.y + (new_position.y * 5 * this.scale));
        this.drawHitbox(context);
    }
};

/********************************************************************************************************************************/

// Initialize game content
var entities = new Array();
entities.push(new Player({id: "Player", position: new Point(50, 50), orientation: 0.0, scale: 1.0, hitbox: new Hitbox(new Point(-25, -25), new Point(25, -25), new Point(25, 25), new Point(-25, 25))}));
var mousePos = new Point(0, 0);
canvas.addEventListener('mousemove', (event) => {
    mousePos.set(event.clientX, event.clientY);
});

/********************************************************************************************************************************/
const fs = require('fs');

function saveGameState(entities) {
    const jsonGameState = JSON.stringify(entities);
    fs.writeFileSync('gameState.json', jsonGameState);
    console.log('Game state saved successfully!');
}

// Function to load game state from a JSON file
function loadGameState() {
    const jsonGameState = fs.readFileSync('gameState.json', 'utf8');
    const entities = JSON.parse(jsonGameState);
    console.log('Game state loaded successfully!');
    return entities;
}
// Save game state to a file
saveGameState(entities);

// Load game state from the file
const loadedEntities = loadGameState();
console.log(loadedEntities);

// GAME LOGIC
function loop() {
	clearCanvas();
	for (var i = 0; i < entities.length; i++) {
		entities[i].update({keyState: keyState, canvas: canvas, context: context, entities: entities});
	}
	window.requestAnimationFrame(loop);
}

/********************************************************************************************************************************/

// START GAME LOOP
loop();