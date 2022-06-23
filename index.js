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
    this.innitialsPositionX =  this.sPosition.x;
    this.innitialCount = 1;

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
  refresh({framesMax,imgSlice,imageSrc}){
    this.image.src = imageSrc;
    this.framesMax = framesMax;
    this.innitialCount++;
    this.sPosition.x+=200;
      if(this.innitialCount>=this.framesMax){
        this.sPosition.x=this.innitialsPositionX;
        this.innitialCount=1;
      };
  };
};

const gravity = 1;
class Sprite extends imageRender {
  constructor({imageSrc, sPosition, sWidth, sHeight, dPosition, dWidth, dHeight}) {
    super({imageSrc, sPosition, sWidth, sHeight, dPosition, dWidth, dHeight })
    this.key = {};
    this.jumpCounter = 2;
    this.height = 150;
    this.health = 100;
    this.characterStatus = "idle"
    this.flying = false;
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
          this.sPosition.x=this.innitialsPositionX;
          this.innitialCount=1;
          this.key[attacking].pressed = true;
         
          break;
        case up:
          if (this.jumpCounter <= 0) {
            this.velocity.y += 0;
          } else {
            this.characterStatus = "jump";
            this.flying = true ;
            this.jumpCounter -= 1;
            this.velocity.y = -20;
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

  draw(){
    //c.fillStyle = "black";
    //c.fillRect(this.dPosition.x, this.dPosition.y, 220, 200);
    this.drawImg();
    //attackBox
  };

  setAttackBox(x,y){
    if (this.key[this.attacking].pressed) {
      this.attackBox.dPosition = {
        x : this.dPosition.x+x,
        y : this.dPosition.y+y
      };
      this.attackBox.width = 130;
      this.attackBox.height = 200;
      //c.fillStyle = "green";
      //c.fillRect(this.attackBox.dPosition.x, this.attackBox.dPosition.y, this.attackBox.width, this.attackBox.height);
    };
  };

  setHitBox(x,y){

    if (this.key[this.attacking].pressed) {
      
      this.attackBox.width = 130;
      this.attackBox.height = 200;
      c.fillStyle = "green";
      c.fillRect(this.dPosition.x+x, this.dPosition.y+y, this.attackBox.width, this.attackBox.height);
    };
  };

  update(){
    if(this.velocity.x>1&&this.flying == false&&this.key[this.attacking].pressed==false){
      this.characterStatus = "run";
    };
    if(this.velocity.x<-1&&this.flying == false&&this.key[this.attacking].pressed==false){
      this.characterStatus = "run";
    };
    if(this.velocity.x==0&&this.flying == false&&this.key[this.attacking].pressed==false){
      this.characterStatus = "idle";
    };
    if(this.velocity.y<0&&this.flying == true&&this.key[this.attacking].pressed==false){
      this.characterStatus = "jump";
    };
    if(this.velocity.y>0&&this.flying == true&&this.key[this.attacking].pressed==false){
      this.characterStatus = "fall";
    };
    if(this.key[this.attacking].pressed){
      this.characterStatus = "attack1";
    };

    if(this.innitialCount>=this.framesMax-1){
      this.key[this.attacking].pressed = false;
    };

    this.dPosition.x += this.velocity.x;
    this.dPosition.y += this.velocity.y;
    if (this.dPosition.y + this.height + this.velocity.y >= canvas.height - 162) {
      this.velocity.y = 0;
      this.jumpCounter = 2;
      this.flying = false;
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
      this.velocity.x = 10;
    } else if (this.key[this.left].pressed && this.lastKey === this.left) {
      this.velocity.x = -10;
    };
  };
};

judgeCollision = (objOne, objTwo) => (
  objOne.attackBox.dPosition.x + (objOne.attackBox.width) >= objTwo.dPosition.x+objTwo.attackBox.width&
  objOne.attackBox.dPosition.x + (objOne.attackBox.width) <= objTwo.dPosition.x + objTwo.dWidth &&
  objOne.attackBox.dPosition.y + (objOne.attackBox.height) / 2 >= objTwo.dPosition.y &&
  objOne.attackBox.dPosition.y + (objOne.attackBox.height / 2) <= objTwo.dPosition.y + objTwo.dHeight
);

successfulCollision = (objOne, attacking, attacked, objTwo) => {
  if (objOne.key[attacking].pressed) {
    console.log(objOne.attackBox.dPosition.x + objOne.attackBox.width , objTwo.dPosition.x+objTwo.attackBox.width )
    console.log(objOne.attackBox.dPosition.x + objOne.attackBox.width , objTwo.dPosition.x + objTwo.dWidth )
    console.log(objOne.attackBox.dPosition.y + (objOne.attackBox.height) / 2  , objTwo.dPosition.y )
    console.log(objOne.attackBox.dPosition.y + (objOne.attackBox.height / 2) , objTwo.dPosition.y + objTwo.dHeight )
    if (judgeCollision(objOne, objTwo)) {
      objOne.health -= 5
      document.querySelector("#objTwo").style.width = objOne.health + "%";
    };
  };

  if (objTwo.key[attacked].pressed) {
    console.log(objOne.attackBox.dPosition.x + objOne.attackBox.width , objTwo.dPosition.x+objTwo.attackBox.width )

    if (judgeCollision(objTwo, objOne)) {
      objTwo.health -= 5
      document.querySelector("#objOne").style.width = objTwo.health + "%";
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

let timer = 999;
decreaseTimer = () => {
  setTimeout(decreaseTimer, 1000);
  if (timer > 0) {
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  };
};
decreaseTimer()

kenjiSprites = (characterStatus) => {
  switch (characterStatus) {
    case "idle": 
      return{
        imageSrc: './img/kenji/Idle.png',
        framesMax: 4
      };
    case "run": 
      return{
        imageSrc: './img/kenji/Run.png',
        framesMax: 8
      };
    case "jump": 
      return{
        imageSrc: './img/kenji/Jump.png',
        framesMax: 3
      };
    case "fall": 
      return{
        imageSrc: './img/kenji/Fall.png',
        framesMax: 3
      };
    case "attack1": 
      return{
        imageSrc: './img/kenji/Attack1.png',
        framesMax: 4
      };
    case "takeHit": 
      return{
        imageSrc: './img/kenji/Take Hit - white silhouette.png',       
        framesMax: 4
        };
     case "death": 
      return{
        imageSrc: './img/kenji/Death.png',
        framesMax: 6
      };
  };
};

samuraiMackSprites = (characterStatus) => {
  switch (characterStatus) {
    case "idle": 
      return{
        imageSrc: './img/samuraiMack/Idle.png',
        framesMax: 8
      };
    case "run": 
      return{
        imageSrc: './img/samuraiMack/Run.png',
        framesMax: 8
      };
    case "jump": 
      return{
        imageSrc: './img/samuraiMack/Jump.png',
        framesMax: 3
      };
    case "fall": 
      return{
        imageSrc: './img/samuraiMack/Fall.png',
        framesMax: 3
      };
    case "attack1": 
      return{
        imageSrc: './img/samuraiMack/Attack1.png',
        framesMax: 6
      };
    case "takeHit": 
      return{
        imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',       
        framesMax: 4
        };
     case "death": 
      return{
        imageSrc: './img/samuraiMack/Death.png',
        framesMax: 6
      };
  };
};

animate = () => {
  setTimeout(()=>window.requestAnimationFrame(animate) , 40)

  background.drawImg()
  shop.drawImg()

  player.update()
  player.setVelocity()
  player.draw()
  player.refresh(samuraiMackSprites(player.characterStatus))
  player.setAttackBox(90,0)
  enemy.update()
  enemy.setVelocity()
  enemy.draw()
  enemy.refresh(kenjiSprites(enemy.characterStatus))
  enemy.setAttackBox(0,0)
  successfulCollision (player, "s", "ArrowDown", enemy)
  
};
animate()