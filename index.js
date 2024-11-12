// dohvat canvas objekta i konteksta
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// postavljanje sirine i visine canvasa
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

// pocetna konfiguracija palice
let batWidth = 100;
let batHeight = 20;
let batSpeed = 10;
let batX = (canvas.width - batWidth) / 2;
let batY = canvas.height - 30;

// pocetna konfiguracija loptice
let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = batY - ballRadius;
let ballSpeed = 4;
let ballSpeedX = 0;
let ballSpeedY = 0;

// pocetna konfiguracija bodova
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// pocetna kofiguracija cigli
let bricks = [];
let rows = 3;
let columns = 5;
let brickWidth = (canvas.width / columns) - 10;
let brickHeight = 30;
let brickPadding = 10;

let gameRunning = true;
let gameMessage = "";

// konfiguracija velicine cigli
// broj, visina i sirina cigli se prilagodava u pocetnim varijablama
// y koordinata pomaknuta kako bi ostalo mjesta za bodove u gornjem desnom kutu
function initializeBricks() {
   for (let row = 0; row < rows; row++) {
      bricks[row] = [];
      for (let col = 0; col < columns; col++) {
         bricks[row][col] = { x: col * (brickWidth + brickPadding), y: row * (brickHeight + brickPadding) + 3 * brickHeight, hit: false };
      }
   }
}

initializeBricks();

// konfiguracija pocetnog smjera loptice
// ideja djelomicno preuzeta s:
//https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
function initializeBallDirection() {
   let angle = (Math.random() * (120) + 30) * (Math.PI / 180);

   if (Math.random() > 0.5) {
      angle = -angle;
  }

   ballSpeedX = ballSpeed * Math.cos(angle);
   ballSpeedY = -Math.abs(ballSpeed * Math.sin(angle));
}

initializeBallDirection();

// postavljanje cigli u canvas objekt
function drawBricks() {
   // postavljanje sjene i boje
   ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
   ctx.shadowBlur = 4;
   ctx.shadowOffsetX = 0;
   ctx.shadowOffsetY = 4;
   ctx.fillStyle = "grey";

   // postavljanje pojedine cigle
   bricks.forEach(row => {
      row.forEach(brick => {
         if (!brick.hit) {
            ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
         }
      });
   });
}

// postavljanje palice u igru
function drawBat() {
   ctx.fillStyle = "red";
   ctx.fillRect(batX, batY, batWidth, batHeight);
   ctx.shadowColor = "transparent";
}

// postavljanje loptice u igru
function drawBall() {
   ctx.beginPath();
   ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
   ctx.fillStyle = "black";
   ctx.fill();
   ctx.closePath();
}

// postavljanje pocetnih bodova
function calculateScore(){
   ctx.fillStyle = "black";
   ctx.textAlign = "right";
   ctx.font = "bold 24px Arial";
   ctx.fillText(`Score: ${score}`, canvas.width - 20, 20);
   ctx.fillText(`Best Score: ${bestScore}`, canvas.width - 20, 50);
}

// postavljanje konfiguracija za sve koalizije u igri
function collisions() {
   // koalizija sa svakom pojedinom ciglom
   // prilikom sudara loptica zadrzava istu x komponentu smjera, a y komponenta se zrcali
   // cigle se brisu pri koaliziji i bodovi se povecavaju za jedan
   bricks.forEach(row => {
      row.forEach(brick => {
         if (!brick.hit && ballX > brick.x && ballX < brick.x + brickWidth && ballY > brick.y && ballY < brick.y + brickHeight) {
            ballSpeedY = -ballSpeedY;
            brick.hit = true;
            score++;
         }
      });
   });

   // koalizija sa lijevim i desnim zidom
   if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballSpeedX = -ballSpeedX;
   // koalizija s vrhom canvas objekta
   if (ballY - ballRadius < 0) ballSpeedY = -ballSpeedY;

   // racunanje smjera loptice pri sudaru s palicom
   // smjer se odreduje racunanjem koji dio palice je loptica pogodila
   // koalizija s lijevim dijelom palice salje lopticu prema lijevo, s desnim prema desno te sa sredinom ravno prema gore
   // takoder ideja preuzeta s:
   // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
   if (ballY + ballRadius > batY && ballX > batX && ballX < batX + batWidth) {
      let hitPosition = ballX - (batX + batWidth / 2);

      let normalizedHitPosition = hitPosition / (batWidth / 2);

      const maxBounceAngle = Math.PI / 3;

      let bounceAngle = normalizedHitPosition * maxBounceAngle;

      ballSpeedX = ballSpeed * Math.sin(bounceAngle);
      ballSpeedY = -ballSpeed * Math.cos(bounceAngle);
   }
}

// funkcija i event listeneri za upravljanje palicom
// dozvoljava fluidni pokret palice s konstantom brzinom odredenom u pocetnim varijablama
let isMovingLeft = false;
let isMovingRight = false;

document.addEventListener("keydown", (e) => {
   if (e.key === "ArrowLeft") {
      isMovingLeft = true;
   } else if (e.key === "ArrowRight") {
      isMovingRight = true;
   }
});

document.addEventListener("keyup", (e) => {
   if (e.key === "ArrowLeft") {
      isMovingLeft = false;
   } else if (e.key === "ArrowRight") {
      isMovingRight = false;
   }
});

function updateBatPosition() {
   if (isMovingLeft && batX > 0) {
      batX -= batSpeed;
   }
   if (isMovingRight && batX < canvas.width - batWidth) {
      batX += batSpeed;
   }
}

// provjera kraja igre
// igra zavrsava pogotkom svake cigle ili kada loptica pogodi donji dio canvas objekta
function endGame() {
   if (ballY + ballRadius > canvas.height || score === rows * columns) {
      score === rows * columns ? gameMessage = "WINNER" : gameMessage = "GAME OVER";
      gameRunning = false;
      localStorage.setItem("bestScore", Math.max(score, bestScore));
   }
}

// postavljanje poruke za kraj igre
function displayEndMessage() {
   ctx.font = "bold 100px Arial";
   ctx.textAlign = "center";
   ctx.textBaseline = "middle";
   ctx.fillText(gameMessage, canvas.width / 2, canvas.height / 2);
}

// funkcija za pokretanje igre
// pocetno ciscenje canvas objekta te ponovno postavljanje kompletne igre
function startGame() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   drawBat();
   drawBall();
   collisions();
   drawBricks();
   calculateScore();
   endGame();

   if (gameRunning) {
      // za vrijeme trajanje igre konstantno postavljanje loptice i palice
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      updateBatPosition();
      requestAnimationFrame(startGame);
   } else {
      // prikaz poruke
      displayEndMessage();
   }
}

// pokretanje igre
startGame();