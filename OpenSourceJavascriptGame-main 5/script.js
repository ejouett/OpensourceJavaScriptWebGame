window.addEventListener('load', function(){
// SETUP
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 600;

    class InputHandler { //handles input from user like arrow keys
       constructor(game){
        this.game = game;
        window.addEventListener('keydown', e => {
            if ((   (e.key === 'ArrowUp') ||
                    (e.key === 'ArrowDown')
            ) && this.game.keys.indexOf(e.key) === -1){
                this.game.keys.push(e.key);
            } else if ( e.key === ' '){
                this.game.player.shootTop();
            }
          // console.log(this.game.keys);
        });
        window.addEventListener('keyup', e => {
            if(this.game.keys.indexOf(e.key) > -1){
                this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
            }
           // console.log(this.game.keys);
        });
       }
    }
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }

    }
    class Particle {

    }
    class Item {

    }
    class Player {
        constructor(game){
            this.game = game;
            this.width = 50;
            this.height = 50;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.speedX = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
        }
        update(){
            if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            //handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            //filters out all that are marked true for deletion
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop(){
            if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x, this.y));
            this.game.ammo--;
            }
        }
    }
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width; //declare x now, declare y in subclasses depending on enemy size
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 2;
            this.score = this.lives;

        }
        update(){
            this.x += this.speedX;
            if(this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '2pc Helvitca';
            context.fillText(this.lives, this.x, this.y);
        }
        
    }
    class Knight1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 50;
            this. height = 50;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }
    class Layer {
        constructor(game, image, speedMod){
            this.game = game;
            this.image = image;
            this.speedMod = speedMod;
           // this.door = door;
            this.width = 1755;
            this.height = 600;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if(this.x <= this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedMod;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
        }
    }
    class Backround {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.layer1 = new Layer(this.game, this.image1, 1);
            this.layers = [this.layer1];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }

    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetX = 2;
            context.shadowColoe = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText('Score: ' + this.game.score, 11, 20);
            //ammo
           // context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 30, 3, 20);
                
            }
            //Game ove messages
            if (this.game.gameover){
                context.textAlign = 'center';
                let msg1;
                let msg2;
                if (this.game.score > this.game.winningScore){
                    msg1 = 'You Win Congrats!';
                    msg2 = 'nice job!';
                } else {
                    msg1 = 'You lost haha';
                    msg2 = 'Better luck next time';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(msg1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.fillText(msg2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            context.restore();
        }
    }
    class Game { //class where all the main game logic will go.
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.backround = new Backround(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 1000;
            this.gameover = false;
            this.score = 0;
            this.winningScore = 20;
            this.speed = 1;
        }
        update(deltaTime){
            this.backround.update();
            this.player.update();
            if (this.ammoTimer > this.ammoInterval){
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.backround.update();
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            this.score += enemy.score;
                            if(this.score > this.winningScore) this.gameover = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameover){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            this.backround.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy(){
            this.enemies.push(new Knight1(this));
        }
        checkCollision(rect1, rect2){ //if all are true returns true they do collide
            return(     rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.height + rect1.y > rect2.y)

        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime); //uses millisec so event will happen at same time on diff computers.
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});