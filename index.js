const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 720;

class imageRender {
  constructor({ imageSrc, sWidth, sHeight, position, dWidth, dHeight }) {
    this.position = position;
    this.dWidth = dWidth;
    this.dHeight = dHeight;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.image = new Image();
    this.image.src = imageSrc;
    this.sx = 0;
    this.sy = 0;
  };
  draw() {
    c.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.sWidth,
      this.sHeight,
      this.position.x,
      this.position.y,
      this.dWidth,
      this.dHeight)
  };
  refresh(count){
    let i=1;
    setInterval(()=>{
      this.sx+=this.sWidth;
      i++
      if(i==count){
        this.sx=0;
        i=0;
      };
    }, 100);
  };
};

const gravity = 0.1;
class Sprite {
  constructor({ position, velocity, color }) {
    this.image = new Image();
    this.image.src = "./img/samuraiMack/Idle.png";
    this.position = position;
    this.velocity = velocity;
    this.jumpCounter = 2;
    this.color = color;
    this.height = 150;
    this.key = {};
    this.attacking = false;
    this.health = 100;
    this.attackBox = {
      position: this.position,
      width: 100,
      height: 50
    };
  };

  setButton(up, down, left, right, attacking) {
    this.up = up;
    this.down = down;
    this.left = left;
    this.right = right;
    this.attacking = attacking;
    this.key[up] = { pressed: false };
    this.key[down] = { pressed: false };
    this.key[left] = { pressed: false };
    this.key[right] = { pressed: false };
    this.key[attacking] = { pressed: false };
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case right:
          this.key[right].pressed = true;
          this.lastKey = right;
          break;
        case left:
          this.key[left].pressed = true;
          this.lastKey = left;
          break;
        case attacking:
          this.key[attacking].pressed = true;
          setTimeout(() => {
            this.key[attacking].pressed = false;
          }, 1000);
          break;
        case up:
          if (this.jumpCounter <= 0) {
            this.velocity.y += 0;
          } else {
            this.jumpCounter -= 1;
            this.velocity.y = -7;
          };
          break;
      };
    });
    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case right:
          this.key[right].pressed = false;
          break;
        case left:
          this.key[left].pressed = false;
          break;

      };
    });
  };

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, 50, this.height);
    c.drawImage(
      this.image,
      80,
      64,
      56,
      64,
      this.position.x,
      this.position.y,
      150,
      150
      );

    //attackBox
    if (this.key[this.attacking].pressed) {
      if (this.lastKey === this.right) {
        this.attackBox.width = 100;
        c.fillStyle = "green";
        c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
      } else if (this.lastKey === this.left) {
        this.attackBox.width = -50;
        c.fillStyle = "green";
        c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
      };
    };
  };

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 100) {
      this.velocity.y = 0;
      this.jumpCounter = 2;
    } else {
      this.velocity.y += gravity;
    };
    this.draw();
  };

  setMove() {
    if (this.key[this.right].pressed === false) {
      this.velocity.x = 0;
    };
    if (this.key[this.left].pressed === false) {
      this.velocity.x = 0;
    };
    if (this.key[this.right].pressed && this.lastKey === this.right) {
      this.velocity.x = 2.5;
    } else if (this.key[this.left].pressed && this.lastKey === this.left) {
      this.velocity.x = -2.5;
    };
  };
};
let timer = 10;
decreaseTimer = () => {
  setTimeout(decreaseTimer, 1000);
  if (timer > 0) {
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  };
};
decreaseTimer()
rectangularCollision = (objOne, objTwo) => (
  objOne.position.x + objOne.attackBox.width >= objTwo.position.x &&
  objOne.position.x + objOne.attackBox.width <= objTwo.position.x + 50 &&
  objOne.position.y + (objOne.attackBox.height) / 2 >= objTwo.position.y &&
  objOne.position.y + (objOne.attackBox.height / 2) <= objTwo.position.y + objTwo.attackBox.height
);

damageRange = (objOne, attacking, attacked, objTwo) => {
  if (objOne.key[attacking].pressed) {
    if (rectangularCollision(objOne, objTwo)) {
      objOne.health -= 5
      document.querySelector("#objTwo").style.width = objOne.health + "%";
      objOne.key[attacking].pressed = false;
    };
  };

  if (objTwo.key[attacked].pressed) {
    if (rectangularCollision(objTwo, objOne)) {
      objTwo.health -= 5
      document.querySelector("#objOne").style.width = objTwo.health + "%";
      objTwo.key[attacked].pressed = false;
    };
  };
};

const player = new Sprite({
  position: {
    x: 150,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: "red"
});
player.setButton("w", "s", "a", "d", "s")

const enemy = new Sprite({
  position: {
    x: 880,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: "black"
}
);
enemy.setButton("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowDown")
shop = new imageRender({
  position: {
    x: 630,
    y: 220
  },
  sWidth: 708/6,
  sHeight: 128,
  dWidth: 384,
  dHeight: 384,
  imageSrc: "./img/shop.png"
});
shop.refresh(6)
background = new imageRender({
  position: {
    x: 0,
    y: 0
  },
  sWidth: 1024,
  sHeight: 576,
  dWidth: 1080,
  dHeight: 720,
  imageSrc: "./img/background.png"
});


animate = () => {
  window.requestAnimationFrame(animate);
  c.fillStyle = "#0000ff";
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.draw()
  shop.draw()
  player.update()
  enemy.update()
  player.setMove()
  enemy.setMove()
  damageRange(player, "s", "ArrowDown", enemy)
};
animate()