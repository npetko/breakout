const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let batWidth = 100;
let batHeight = 10;
let batX = (canvas.width - batWidth) / 2;
let batY = canvas.height - 30;
let ballRadius = 8;
let ballX = canvas.width / 2;
let ballY = batY - ballRadius;
let ballSpeedX = 2 * (Math.random() < 0.5 ? -1 : 1);
let ballSpeedY = -2;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let bricks = [];
let rows = 3;
let columns = 7;
let brickWidth = (canvas.width / columns) - 10;
let brickHeight = 20;
let brickPadding = 10;
let gameRunning = true;

function initializeBricks() {
   for (let row = 0; row < rows; row++) {
       bricks[row] = [];
       for (let col = 0; col < columns; col++) {
           bricks[row][col] = { x: col * (brickWidth + brickPadding), y: row * (brickHeight + brickPadding), hit: false };
       }
   }
}

initializeBricks();

function drawBricks() {
   ctx.fillStyle = "grey";
   bricks.forEach(row => {
       row.forEach(brick => {
           if (!brick.hit) {
               ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
           }
       });
   });
}

function startGame() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   drawBricks();
}

startGame();