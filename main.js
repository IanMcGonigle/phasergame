import './style.css'
import Phaser, { Physics } from 'phaser';

const sizes = {
  width: 800,
  height: 500,
  scoopHeight: 93,
  scoopWidth: 125,
  coneHeight: 120,
  coneWidth: 145,

}

const playBtn = document.querySelector('#play');
const restartBtn = document.querySelector('#restart');
const sceneName = 'scene-game';
let paused = true;

const speedDown = 400;

const randomX = () => (sizes.width - 200) * Math.random() + 150;

class GameScene extends Phaser.Scene {
  constructor(){
    super(sceneName);
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 800;
    this.caught = [];
    this.initialOffset;
    this.missed = 0;
  }

  preload(){
    this.load.image('bg', 'farm.jpg');
    this.load.image('cone', 'cone.png');
    this.load.image('scoop', 'scoop.png');
  }
  create(){
    this.scene.pause(sceneName);

    this.add.image(200,200, 'bg')
    this.player = this.physics
      .add.image( sizes.width/2, sizes.height - 75, 'cone');

    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player.setSize(sizes.coneWidth/4, 10)
    this.initialOffset = this.player.body.offset.y;
    this.cursor = this.input.keyboard.createCursorKeys();

    this.createtarget();    
  }
  update(){

    if(this.caught.length > 9){
      console.log('winner')
    }

    if(this.missed > 9 ){
      console.log('loser')
    }

    const { left, right } = this.cursor;

    if(left.isDown){
      this.player.setVelocityX(-this.playerSpeed);
    }else if(right.isDown){
      this.player.setVelocityX(this.playerSpeed);
    }else{
      this.player.setVelocityX(0);
    }

    this.caught.forEach( data => {
      const { scoop, yOffset, xOffset } = data;
      scoop.y = yOffset;
      scoop.x = this.player.x + xOffset;
    })
    if(this.target.y > sizes.height){
      this.resetTarget();
      this.missed++;
    }
  }

  createtarget(){
    this.target = this.physics.add
      .image(randomX(), -sizes.scoopHeight, 'scoop')
      .setOrigin(0,0).setVelocityY(speedDown + this.caught.length * 50)
      .setMaxVelocity(0, speedDown + this.caught.length * 50);

    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);
  }

  resetTarget() {
    this.target.setY(0);
    this.target.setX(randomX());
  }

  targetHit() {
    const playerX = this.player.x;
    const scoop = this.target;
    const scoopData = {
      scoop,
      yOffset: scoop.y,
      xOffset: scoop.x - playerX
    }
    this.caught = [...this.caught, scoopData];
    this.target = null;
    this.physics.world.colliders.destroy();
    console.log('this.scene.gravity ', this.scene.arcade)
    updateScore( this.caught.length)
    const newOffset = this.caught.length * -sizes.scoopHeight/3 + this.initialOffset;
    this.player.setOffset(0, newOffset)
    this.createtarget();
  }

}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas:gameCanvas,
  physics: {
    default:'arcade',
    arcade: {
      gravity: {y:speedDown},
      debug: false
    }
  },
  scene:[GameScene]
};

const game = new Phaser.Game(config);

const togglePaused = () => {
  game.scene.resume()
    if(paused){
      game.scene.resume(sceneName);
    }else{
      game.scene.pause(sceneName);
    }
    paused = !paused;
}

const updateScore = count => {
  console.log(count)
  document.querySelector('#score').innerText = count;
}

playBtn.addEventListener('click', () => {
  console.log('clicked ')
  togglePaused();
});

restartBtn.addEventListener('click', () => window.location.reload() );

document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    togglePaused();
  }
})

