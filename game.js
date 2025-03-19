const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const player1 = { x: 50, y: canvas.height / 2, radius: 20, color: "orange" };
const player2 = { x: canvas.width - 50, y: canvas.height / 2, radius: 20, color: "black" };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 15, dx: 3, dy: 3, color: "white" };

const goal1 = { x: 0, y: canvas.height / 3, width: 5, height: canvas.height / 3, color: "brown" };
const goal2 = { x: canvas.width - 5, y: canvas.height / 3, width: 5, height: canvas.height / 3, color: "brown" };

let score1 = 0, score2 = 0;
let timer = 120;
let gameRunning = false;
let interval;

const goalSound = new Audio("goal.mp3");

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    
    const voices = speechSynthesis.getVoices();
    const brazilianVoice = voices.find(voice => voice.lang === "pt-BR" && !voice.name.includes("Google"));

    if (brazilianVoice) {
        utterance.voice = brazilianVoice;
    }

    speechSynthesis.speak(utterance);
}


function drawCircle(obj) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
    ctx.fillStyle = obj.color;
    ctx.fill();
    ctx.closePath();
}

function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(goal1);
    drawRect(goal2);
    drawCircle(player1);
    drawCircle(player2);
    drawCircle(ball);
}

function checkCollision(player, ball) {
    let dx = ball.x - player.x;
    let dy = ball.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < player.radius + ball.radius;
}

function updateGame() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
    }

    if (checkCollision(player1, ball)) {
        ball.dx = Math.abs(ball.dx);
    }
    if (checkCollision(player2, ball)) {
        ball.dx = -Math.abs(ball.dx);
    }

    if (ball.x - ball.radius < 0) {
        if (ball.y > goal1.y && ball.y < goal1.y + goal1.height) {
            score2++;
            goalSound.play();
            speak("GOL DO TIME 2");
            resetBall();
        } else {
            ball.dx *= -1;
        }
    }

    if (ball.x + ball.radius > canvas.width) {
        if (ball.y > goal2.y && ball.y < goal2.y + goal2.height) {
            score1++;
            goalSound.play();
            speak("GOL DO TIME 1");
            resetBall();
        } else {
            ball.dx *= -1;
        }
    }

    // Nova lógica de movimento dos jogadores
    if (input.up1 && player1.y - player1.radius > 0) player1.y -= 5;
    if (input.down1 && player1.y + player1.radius < canvas.height) player1.y += 5;
    if (input.up2 && player2.y - player2.radius > 0) player2.y -= 5;
    if (input.down2 && player2.y + player2.radius < canvas.height) player2.y += 5;

    document.getElementById("player1Goals").textContent = score1;
    document.getElementById("player2Goals").textContent = score2;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
}

function checkWinner() {
    let result = `O jogo acabou! Placar final: Player 1 - ${score1}, Player 2 - ${score2}.`;
    if (score1 > score2) {
        speak(result + " Parabéns Player 1, você venceu!");
    } else if (score2 > score1) {
        speak(result + " Parabéns Player 2, você venceu!");
    } else {
        speak(result + " O jogo terminou empatado!");
    }
}

function gameLoop() {
    drawGame();
    updateGame();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    console.log("Tecla pressionada:", e.key); // Verifica se as teclas estão sendo reconhecidas

    const speed = 30;
    
    if (e.key.toLowerCase() === "w" && player1.y - player1.radius > 0) {
        player1.y -= speed;
        console.log("Movendo Player 1 para cima:", player1.y);
    }
    
    if (e.key.toLowerCase() === "s" && player1.y + player1.radius < canvas.height) {
        player1.y += speed;
        console.log("Movendo Player 1 para baixo:", player1.y);
    }
    
    if (e.key === "ArrowUp" && player2.y - player2.radius > 0) {
        player2.y -= speed;
        console.log("Movendo Player 2 para cima:", player2.y);
    }
    
    if (e.key === "ArrowDown" && player2.y + player2.radius < canvas.height) {
        player2.y += speed;
        console.log("Movendo Player 2 para baixo:", player2.y);
    }
});


function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        interval = setInterval(() => {
            if (timer > 0) {
                timer--;
                document.getElementById("timer").textContent = timer;
            } else {
                clearInterval(interval);
                gameRunning = false;
                checkWinner();
            }
        }, 1000);
    }
}

function pauseGame() {
    gameRunning = !gameRunning;
}

function resetGame() {
    score1 = 0;
    score2 = 0;
    timer = 120;
    gameRunning = false;
    clearInterval(interval);
    document.getElementById("player1Goals").textContent = score1;
    document.getElementById("player2Goals").textContent = score2;
    document.getElementById("timer").textContent = timer;
    resetBall();
    drawGame();
}

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("pauseGame").addEventListener("click", pauseGame);
document.getElementById("resetGame").addEventListener("click", resetGame);

gameLoop();