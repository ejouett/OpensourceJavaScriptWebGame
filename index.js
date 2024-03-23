// SETUP
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
canvas.width = 1500;
canvas.height = 900;
function clearCanvas() {
	var prevStyle = context.fillStyle;
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = prevStyle;
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
	"ArrowRight"
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
class Entity {
	// A top-level class which stores anything not related to level maps
	constructor({id}) { this.id = id; };
}

class Agent extends Entity {
	// An Entity which has dynamic AI behavior (Player, Mobs, Enemy...)
	constructor({id, position, dimensions, velocity}) {
		super(id);
		this.position = position;
		this.dimensions = dimensions;
		this.velocity = velocity;
	}
	update({canvas, context}) { return new Error("Incomplete"); }
	draw({context}) { return new Error("Incomplete"); }
}

class Player extends Agent {
	// The Agent the player is in control of
	constructor({position, dimensions, velocity}) { super({id: "playerId", position, dimensions, velocity}); }
	update({keyState, canvas, context}) {
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
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		if (this.position.x > canvas.width) {
			this.position.x = -1 * this.dimensions.width;
		} else if (this.position.x < -1 * this.dimensions.width) {
			this.position.x = canvas.width;
		}
		if (this.position.y > canvas.height) {
			this.position.y = -1 * this.dimensions.height;
		} else if (this.position.y < -1 * this.dimensions.height) {
			this.position.y = canvas.height;
		}
		this.draw({context});
	}
	draw({context}) {
		var prevStyle = context.fillStyle;
		context.fillStyle = "#FF0000";
		context.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height);
		context.fillStyle = prevStyle;
	}
}

class NPC extends Agent {
	// A non-player Agent
	constructor({id, position, dimensions, velocity}) { super({id, position, dimensions, velocity}); }
}

class Enemy extends NPC {
	// A hostile NPC
	constructor({id, position, dimensions, velocity}) { super({id, position, dimensions, velocity}); }
}

class Interactable extends Entity {
	// An Entity an Agent can interact with
	constructor({id}) { super({id}); }
}

class Item extends Interactable {
	// An Interactable which can be picked up by an Agent
	constructor({id}) { super({id}); }
}

class Equipable extends Interactable {
	// An item an Agent can equip
	constructor({id}) { super({id}); }
	equip() { return new Error("Incomplete"); }
}

/********************************************************************************************************************************/

// Initialize game content
var agents = [];
agents.push(new Player({position: {x: 0, y: 0}, dimensions: {width: 50, height: 50}, velocity: {x: 0, y: 10}}));

/********************************************************************************************************************************/

// GAME LOGIC
function loop() {
	clearCanvas();
	for (var i = 0; i < agents.length; i++) {
		agents[i].update({keyState: keyState, canvas: canvas, context: context});
	}
	window.requestAnimationFrame(loop);
}

/********************************************************************************************************************************/

// START GAME LOOP
loop();