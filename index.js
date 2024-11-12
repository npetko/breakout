const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let batWidth = 100;
let batHeight = 10;
let batX = (canvas.width - batWidth) / 2;
let batY = canvas.height - 30;
let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = batY - ballRadius;
let ballSpeed = 4;
let ballSpeedX = 0;
let ballSpeedY = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let bricks = [];
let rows = 3;
let columns = 7;
let brickWidth = (canvas.width / columns) - 10;
let brickHeight = 20;
let brickPadding = 10;
let gameRunning = true;
let gameMessage = "";

function initializeBricks() {
   for (let row = 0; row < rows; row++) {
      bricks[row] = [];
      for (let col = 0; col < columns; col++) {
         bricks[row][col] = { x: col * (brickWidth + brickPadding), y: row * (brickHeight + brickPadding) + 3 * brickHeight, hit: false };
      }
   }
}

initializeBricks();

function initializeBallDirection() {
   let angle = (Math.random() * (120) + 30) * (Math.PI / 180);

   if (Math.random() > 0.5) {
      angle = -angle;
  }

   ballSpeedX = ballSpeed * Math.cos(angle);
   ballSpeedY = -Math.abs(ballSpeed * Math.sin(angle));
}

initializeBallDirection();

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

function drawBat() {
   ctx.fillStyle = "red";
   ctx.fillRect(batX, batY, batWidth, batHeight);
}

function drawBall() {
   ctx.beginPath();
   ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
   ctx.fillStyle = "black";
   ctx.fill();
   ctx.closePath();
}

function calculateScore(){
   ctx.fillStyle = "black";
   ctx.textAlign = "right";
   ctx.fillText(`Score: ${score}`, canvas.width - 20, 20);
   ctx.fillText(`Best Score: ${bestScore}`, canvas.width - 20, 40);
}

function collisions() {
   bricks.forEach(row => {
      row.forEach(brick => {
         if (!brick.hit && ballX > brick.x && ballX < brick.x + brickWidth && ballY > brick.y && ballY < brick.y + brickHeight) {
            ballSpeedY = -ballSpeedY;
            brick.hit = true;
            score++;
         }
      });
   });

   if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballSpeedX = -ballSpeedX;
   if (ballY - ballRadius < 0) ballSpeedY = -ballSpeedY;

   if (ballY + ballRadius > batY && ballX > batX && ballX < batX + batWidth) {
      let hitPosition = ballX - (batX + batWidth / 2);

      let normalizedHitPosition = hitPosition / (batWidth / 2);

      const maxAngleChangeFactor = 1.5;
      ballSpeedX += maxAngleChangeFactor * normalizedHitPosition * Math.abs(ballSpeedY);

      ballSpeedY = -ballSpeedY;
   }
}

function endGame() {
   if (ballY + ballRadius > canvas.height || score === rows * columns) {
      score === rows * columns ? gameMessage = "WINNER" : gameMessage = "GAME OVER";
      gameRunning = false;
      localStorage.setItem("bestScore", Math.max(score, bestScore));
   }
}

function displayEndMessage() {
   ctx.fillText(gameMessage, canvas.width / 2, canvas.height / 2);
}

function startGame() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   drawBricks();
   drawBat();
   drawBall();
   calculateScore();
   collisions();
   endGame();

   if (gameRunning) {
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      requestAnimationFrame(startGame)
   } else {
      displayEndMessage();
   }
}

document.addEventListener("keydown", (e) => {
   if (e.key === "ArrowLeft" && batX > 0) batX -= 20;
   if (e.key === "ArrowRight" && batX + batWidth < canvas.width) batX += 20;
});

startGame();