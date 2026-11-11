
/* ========================================
   SNAKELY GAME
======================================== */

const stage = document.querySelector(".stage");
const scoreElement = document.querySelector("#score");
const gameOverElement = document.querySelector("#gameOver");
const finalScoreElement = document.querySelector("#finalScore");
const restartButton = document.querySelector("#restart");

const COLS = 28;
const ROWS = 16;

let snake = [];
let food = {};
let direction = "right";
let nextDirection = "right";
let score = 0;
let speed = 110;
let gameInterval = null;
let gameRunning = false;

let tileWidth = 0;
let tileHeight = 0;

let board = [];

/* ========================================
   INITIALIZATION
======================================== */

function initGame() {
    clearInterval(gameInterval);

    score = 0;
    speed = 110;

    direction = "right";
    nextDirection = "right";

    snake = [
        { x: 8, y: 3 },
        { x: 7, y: 3 },
        { x: 6, y: 3 },
        { x: 5, y: 3 },
        { x: 4, y: 3 }
    ];

    scoreElement.textContent = score;

    gameOverElement.classList.remove("show");

    createBoard();
    createFood();

    gameRunning = true;

    render();

    gameInterval = setInterval(gameLoop, speed);
}

/* ========================================
   BOARD
======================================== */

function createBoard() {
    stage.querySelectorAll(".tile, .snake, .food").forEach(el => el.remove());

    board = [];

    tileWidth = stage.clientWidth / COLS;
    tileHeight = stage.clientHeight / ROWS;

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = document.createElement("div");

            tile.className = "tile";

            tile.style.left = `${x * tileWidth}px`;
            tile.style.top = `${y * tileHeight}px`;

            tile.style.width = `${tileWidth - 1}px`;
            tile.style.height = `${tileHeight - 1}px`;

            stage.appendChild(tile);

            board.push({
                x,
                y,
                element: tile
            });
        }
    }
}

/* ========================================
   FOOD
======================================== */

function createFood() {
    let available = [];

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const occupied = snake.some(
                part => part.x === x && part.y === y
            );

            if (!occupied) {
                available.push({ x, y });
            }
        }
    }

    if (available.length === 0) {
        finishGame(true);
        return;
    }

    food = available[Math.floor(Math.random() * available.length)];
}

/* ========================================
   GAME LOOP
======================================== */

function gameLoop() {
    if (!gameRunning) return;

    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "right") head.x++;
    if (direction === "left") head.x--;
    if (direction === "up") head.y--;
    if (direction === "down") head.y++;

    // Wrap around walls

    if (head.x >= COLS) head.x = 0;
    if (head.x < 0) head.x = COLS - 1;

    if (head.y >= ROWS) head.y = 0;
    if (head.y < 0) head.y = ROWS - 1;

    const ateFood = head.x === food.x && head.y === food.y;

    // Check collision with body.
    // The tail moves away if food is not eaten.

    const body = ateFood ? snake : snake.slice(0, -1);

    const collision = body.some(
        part => part.x === head.x && part.y === head.y
    );

    if (collision) {
        finishGame();
        return;
    }

    snake.unshift(head);

    if (ateFood) {
        score++;

        scoreElement.textContent = score;

        createFood();

        // Increase speed

        speed = Math.max(45, 110 - score * 2);

        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);

    } else {
        snake.pop();
    }

    render();
}

/* ========================================
   RENDER
======================================== */

function render() {
    const snakePositions = new Set(
        snake.map(part => `${part.x},${part.y}`)
    );

    board.forEach(tile => {
        const key = `${tile.x},${tile.y}`;

        tile.element.classList.toggle(
            "path",
            tile.x === food.x || tile.y === food.y
        );

        tile.element.classList.toggle(
            "pressed",
            snakePositions.has(key)
        );
    });

    // Remove previous snake and food

    stage.querySelectorAll(".snake, .food").forEach(el => el.remove());

    // Render snake

    snake.forEach((part, index) => {
        const segment = document.createElement("div");

        segment.className = "snake";

        segment.style.left = `${part.x * tileWidth}px`;
        segment.style.top = `${part.y * tileHeight}px`;

        segment.style.width = `${tileWidth - 1}px`;
        segment.style.height = `${tileHeight - 1}px`;

        segment.style.opacity = 1 - index / snake.length * 0.35;

        if (index === 0) {
            segment.style.boxShadow =
                "0 0 10px white, 0 0 25px rgba(255,255,255,0.6)";
        }

        stage.appendChild(segment);
    });

    // Render food

    const foodElement = document.createElement("div");

    foodElement.className = "food";

    foodElement.style.left = `${food.x * tileWidth}px`;
    foodElement.style.top = `${food.y * tileHeight}px`;

    foodElement.style.width = `${tileWidth - 2}px`;
    foodElement.style.height = `${tileHeight - 2}px`;

    stage.appendChild(foodElement);
}

/* ========================================
   GAME OVER
======================================== */

function finishGame(won = false) {
    gameRunning = false;

    clearInterval(gameInterval);

    finalScoreElement.textContent = score;

    gameOverElement.querySelector("h1").textContent =
        won ? "YOU WIN!" : "GAME OVER";

    gameOverElement.classList.add("show");
}

/* ========================================
   CONTROLS
======================================== */

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    const controls = {
        arrowup: "up",
        w: "up",

        arrowdown: "down",
        s: "down",

        arrowleft: "left",
        a: "left",

        arrowright: "right",
        d: "right"
    };

    const newDirection = controls[key];

    if (!newDirection) return;

    event.preventDefault();

    const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    };

    if (newDirection !== opposite[direction]) {
        nextDirection = newDirection;
    }
});

/* ========================================
   RESTART
======================================== */

restartButton.addEventListener("click", initGame);

/* ========================================
   RESIZE
======================================== */

window.addEventListener("resize", function() {
    if (!gameRunning) return;

    createBoard();
    render();
});

/* ========================================
   START
======================================== */

initGame();
