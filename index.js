const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 720;

class imageRender {
  constructor({ imageSrc, sPosition, sWidth, sHeight, dPosition, dWidth, dHeight }) {
    this.dPosition = dPosition;
    this.sPosition = sPosition;
    this.dWidth = dWidth;
    this.dHeight = dHeight;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.image = new Image();
    this.image.src = imageSrc;
  };
  drawImg() {
    c.drawImage(
      this.image,
      this.sPosition.x,
      this.sPosition.y,
      this.sWidth,
      this.sHeight,
      this.dPosition.x,
      this.dPosition.y,
      this.dWidth,
      this.dHeight)
  };
  refresh(count,imgSlice,time ){
    this.count = count;
    let i=1;
    this.innitialsPositionX =  this.sPosition.x;
    setInterval(()=>{
      this.sPosition.x+=imgSlice;
      i++;      
      if(i==count){
        this.sPosition.x=this.innitialsPositionX;
        i=1;
      };
    }, time);
  };
};

const gravity = 0.1;
class Sprite extends imageRender {
  constructor({imageSrc, sPosition, sWidth, sHeight, dPosition, dWidth, dHeight}) {
    super({imageSrc, sPosition, sWidth, sHeight, dPosition, dWidth, dHeight })
    this.key = {};
    this.jumpCounter = 2;
    this.height = 150;
    this.attacking = false;
    this.health = 100;
    this.velocity = {
      x: 0,
      y: 0
    };
    this.attackBox = {
      dPosition: this.dPosition,
      width: 100,
      height: 50
    };
  };

  setButton(up, down, left, right, attacking){
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
          this.sPosition.x=this.innitialsPositionX;
          this.count = 3;
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
          this.image.src =  "img/samuraiMack/idle.png";
          break;
        case left:
          this.key[left].pressed = false;
          this.image.src =  "img/samuraiMack/idle.png";
          break;

      };
    });
  };

  draw(){
    //c.fillRect(this.dPosition.x, this.dPosition.y, 115, 150);
    this.drawImg();
    //attackBox
    if (this.key[this.attacking].pressed) {
      this.count = 1;
      this.sPosition.x = this.innitialsPositionX;
      this.image.src =  "img/samuraiMack/Attack1.png";
      this.key[this.attacking].pressed = false;
      if (this.lastKey === this.right) {
        this.attackBox.width = 100;
        c.fillStyle = "green";
        c.fillRect(this.attackBox.dPosition.x, this.attackBox.dPosition.y, this.attackBox.width, this.attackBox.height);
      } else if (this.lastKey === this.left) {
        this.attackBox.width = -50;
        c.fillStyle = "green";
        c.fillRect(this.attackBox.dPosition.x, this.attackBox.dPosition.y, this.attackBox.width, this.attackBox.height);
      };
    };
  };

  update(){
    this.dPosition.x += this.velocity.x;
    this.dPosition.y += this.velocity.y;
    if (this.dPosition.y + this.height + this.velocity.y >= canvas.height - 162) {
      this.velocity.y = 0;
      this.jumpCounter = 2;
    } else {
      this.velocity.y += gravity;
    };
    this.draw();
  };

  setVelocity(){
    if (this.key[this.right].pressed === false) {
      this.velocity.x = 0;
    };
    if (this.key[this.left].pressed === false) {
      this.velocity.x = 0;
    };
    if (this.key[this.right].pressed && this.lastKey === this.right) {
      this.image.src =  "img/samuraiMack/run.png";
      this.velocity.x = 2.5;
    } else if (this.key[this.left].pressed && this.lastKey === this.left) {
      this.image.src =  "img/samuraiMack/run.png";
      this.velocity.x = -2.5;
    };
  };
};

judgeCollision = (objOne, objTwo) => (
  objOne.dPosition.x + objOne.attackBox.width >= objTwo.dPosition.x &&
  objOne.dPosition.x + objOne.attackBox.width <= objTwo.dPosition.x + objTwo.dWidth &&
  objOne.dPosition.y + (objOne.attackBox.height) / 2 >= objTwo.dPosition.y &&
  objOne.dPosition.y + (objOne.attackBox.height / 2) <= objTwo.dPosition.y + objTwo.dHeight
);

successfulCollision = (objOne, attacking, attacked, objTwo) => {
  if (objOne.key[attacking].pressed) {
    if (judgeCollision(objOne, objTwo)) {
      objOne.health -= 5
      document.querySelector("#objTwo").style.width = objOne.health + "%";
      objOne.key[attacking].pressed = false;
    };
  };

  if (objTwo.key[attacked].pressed) {
    if (judgeCollision(objTwo, objOne)) {
      objTwo.health -= 5
      document.querySelector("#objOne").style.width = objTwo.health + "%";
      objTwo.key[attacked].pressed = false;
    };
  };
};


const player = new Sprite({
  sPosition: {
    x: 70,
    y: 50
  },
  dPosition: {
    x: 200,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: "black",
  sWidth: 120,
  sHeight: 74,
  dWidth: 220,
  dHeight: 200,
  imageSrc: "img/samuraiMack/idle.png",
  }
);
player.setButton("w", "s", "a", "d", "s")
player.refresh(8,200,50)

const enemy = new Sprite({
  sPosition: {
    x: 0,
    y: 50
  },
  dPosition: {
    x: 880,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: "black",
  sWidth: 120,
  sHeight: 80,
  dWidth: 220,
  dHeight: 200,
  imageSrc: "./img/kenji/Idle.png",
}
);
enemy.setButton("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowDown")
enemy.refresh(4,200,200)

let shop = new imageRender({
  sPosition: {
    x: 0,
    y: 0
  },
  dPosition: {
    x: 632,
    y: 215
  },
  sWidth: 708/6,
  sHeight: 128,
  dWidth: 384,
  dHeight: 384,
  imageSrc: "./img/shop.png",
});
shop.refresh(6,shop.sWidth,100)

let background = new imageRender({
  sPosition: {
    x: 0,
    y: 0
  },
  dPosition: {
    x: 0,
    y: 0
  },
  sWidth: 1024,
  sHeight: 576,
  dWidth: 1080,
  dHeight: 720,
  imageSrc: "./img/background.png",
});


animate = () => {
  window.requestAnimationFrame(animate);

  background.drawImg()
  shop.drawImg()

  player.update()
  player.setVelocity()
  player.draw()
  enemy.update()
  enemy.setVelocity()
  enemy.draw()
  
};
animate()

let timer = 999;
decreaseTimer = () => {
  setTimeout(decreaseTimer, 1000);
  if (timer > 0) {
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  };
};
decreaseTimer()