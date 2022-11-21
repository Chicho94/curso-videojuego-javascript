const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#spanLives');
const spanTime = document.querySelector('#spanTime');
const spanRecord = document.querySelector('#spanRecord');
const pRecord = document.querySelector('#pRecord');
const modal = document.querySelector('#modal-container');
const body = document.body;
const playFinish = document.querySelector('#playFinish'); 
const playAgain = document.querySelector('#playAgain');
const messageWin = document.querySelector('#message-container-win');
const messageLose = document.querySelector('#message-container-lose'); 

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let timeStart;
let timePlayer;
let timeInterval;
let bombExplodes = [];

const playerPosition = {
  x: undefined,
  y: undefined,
};
const giftPosition = {
  x: undefined,
  y: undefined,
};
let enemyPositions = [];

if(localStorage.getItem('record_time')) showRecordTime();

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

modal.addEventListener('click',()=>{
  modal.classList.remove('one');
  modal.classList.add('out');
  body.classList.remove('modal-active');
});

playAgain.addEventListener('click',()=>{
  level = 0;
  lives = 3;
  bombExplodes = [];
  timeStart = undefined;
  showLives();  
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
});


function setCanvasSize() {
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.8;
  } else {
    canvasSize = window.innerHeight * 0.8;
  }
  
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);
  
  elementsSize = parseInt((canvasSize / 10).toFixed(0));

  startGame();
  showLives();
}

function startGame() {
  game.font = elementsSize + 'px Verdana';
  game.textAlign = 'end';

  const map = maps[level];

  if(!map){
    gameWin();
    showRecordTime();
    return;
  }

  if(!timeStart){
    timeStart = Date.now();
    timeInterval = setInterval(() => showTime(), 100);
  }

  const mapRows = map.trim().split('\n');
  const mapRowCols = mapRows.map(row => row.trim().split(''));
  
  enemyPositions = [];
  game.clearRect(0,0,canvasSize, canvasSize);

  mapRowCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      let posX = elementsSize * (colI + 1);
      let posY = elementsSize * (rowI + 1);
      let explode = bombExplodes.find((bomb)=> bomb?.positionX === posX && bomb?.positionY === posY);
      const emoji = (explode) ? emojis['EXPLODE']: emojis[col];

      if (col == 'O' && (!playerPosition.x && !playerPosition.y)) {
          playerPosition.x = posX;
          playerPosition.y = posY;
      } else if (col == 'I') {
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if (col == 'X') {
        enemyPositions.push({
          x: posX,
          y: posY,
        });
      }
      
      game.fillText(emoji, posX, posY);
    });
  });

  movePlayer();
}

function movePlayer() {
  const giftCollisionX = playerPosition.x == giftPosition.x;
  const giftCollisionY = playerPosition.y == giftPosition.y;
  const giftCollision = giftCollisionX && giftCollisionY;

  if (giftCollision) {
    levelWin();
    startGame();
  }

  const enemyCollision = enemyPositions.find(enemy => {
    const enemyCollisionX = enemy.x == playerPosition.x;
    const enemyCollisionY = enemy.y == playerPosition.y;
    return enemyCollisionX && enemyCollisionY;
  });
  
  if (enemyCollision) {
    const bombCOllision = {positionX: playerPosition.x, positionY: playerPosition.y};
    bombExplodes.push(bombCOllision);
    levelFail();
    
    startGame();
  }

  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

function moveByKeys(event) {
  if (event.key == 'ArrowUp') moveUp();
  else if (event.key == 'ArrowLeft') moveLeft();
  else if (event.key == 'ArrowRight') moveRight();
  else if (event.key == 'ArrowDown') moveDown();

}
function moveUp() {
  if ((playerPosition.y - elementsSize) > elementsSize) {
    playerPosition.y -= elementsSize;
    startGame();
  }
}
function moveLeft() {
  if ((playerPosition.x - elementsSize) > elementsSize) {
    playerPosition.x -= elementsSize;
    startGame();
  }
}
function moveRight() {
  if ((playerPosition.x + elementsSize) < canvasSize) {
    playerPosition.x += elementsSize;
    startGame();
  }
}
function moveDown() {
  
  if ((playerPosition.y + elementsSize) < canvasSize) {
    playerPosition.y += elementsSize;
    startGame();
  }
}

function levelWin(){
  return level++;
}

function gameWin() {

  showModal('win');
  clearInterval(timeInterval);

  const playerTime = Date.now() - timeStart;
  const recordTime = localStorage.getItem('record_time');

  if(!recordTime) localStorage.setItem('record_time', playerTime);
  if(recordTime >= playerTime) localStorage.setItem('record_time', playerTime);

}

function levelFail(){
  lives--;
  if(lives <= 0) {
    showModal('lose');
    clearInterval(timeInterval);
  }

  showLives();
  
  playerPosition.x = undefined;
  playerPosition.y = undefined;

}

function showLives() {
  spanLives.innerHTML = emojis["HEART"].repeat(lives);
}

function showTime(){
  spanTime.innerHTML = Date.now() - timeStart;
}

function showRecordTime(){
  pRecord.style.visibility = "visible";
  spanRecord.innerHTML = localStorage.getItem('record_time');
  return;
}

function showModal(conclusion){
  if(conclusion === 'win'){
    messageWin.style.display = 'block';
    messageLose.style.display = 'none';
  } else {
    messageWin.style.display = 'none';
    messageLose.style.display = 'block';

  }

  modal.classList.remove('out');
  modal.classList.add('one');
  body.classList.add('modal-active');
}