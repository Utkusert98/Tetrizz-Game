const canvas = document.getElementById("gameCanvas");
const blockCanvas = document.getElementById("blockCanvas");
const ctx = canvas.getContext("2d");
const blockCtx = blockCanvas.getContext("2d");

const rows = 20;
const cols = 10;
const blockSize = 32;

canvas.width = cols * blockSize;
canvas.height = rows * blockSize;

blockCanvas.width = 200; 
blockCanvas.height = 200;

blockCanvas.style.display = 'block';
blockCanvas.style.margin = '0 auto';

const colors = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];
const shapes = [
    [[1, 1, 1, 1]],                 
    [[1, 0, 0], [1, 1, 1]],         
    [[0, 0, 1], [1, 1, 1]],         
    [[1, 1], [1, 1]],               
    [[0, 1, 1], [1, 1, 0]],         
    [[1, 1, 1], [0, 1, 0]],         
    [[1, 1, 0], [0, 1, 1]],         
];

let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let score = 0;

let currentPiece;
let currentX = 0;
let currentY = 0;

function getRandomPiece() {
    const id = Math.floor(Math.random() * shapes.length);
    const shape = shapes[id];
    const color = colors[id];
    return { shape, color };
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x] !== 0) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell !== 0) {
                ctx.fillStyle = currentPiece.color;
                ctx.fillRect((currentX + x) * blockSize, (currentY + y) * blockSize, blockSize, blockSize);
                ctx.strokeRect((currentX + x) * blockSize, (currentY + y) * blockSize, blockSize, blockSize);
            }
        });
    });
}

function canMove(dx, dy) {
    return currentPiece.shape.every((row, y) =>
        row.every((cell, x) => {
            if (cell === 0) return true;
            const newX = currentX + x + dx;
            const newY = currentY + y + dy;
            return newY < rows && newX >= 0 && newX < cols && (newY < 0 || board[newY][newX] === 0);
        })
    );
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell !== 0) {
                board[currentY + y][currentX + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            updateScore(100); // Skoru güncelle
        }
    }
}

function updateScore(points) {
    score += points;
    document.getElementById("score").textContent = score.toString().padStart(3, '0'); // Skoru ekranda göster
}

function resetGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    document.getElementById("score").textContent = score.toString().padStart(3, '0'); // Skoru sıfırla
    spawnPiece();
}

function spawnPiece() {
    currentPiece = getRandomPiece();
    currentX = Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    if (!canMove(0, 0)) {
        alert("Oyun Bitti");
        resetGame();
    }
    drawNextPiece(); 
}

function drawNextPiece() {
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);  

    
    const shapeWidth = currentPiece.shape[0].length * blockSize;
    const shapeHeight = currentPiece.shape.length * blockSize;

    
    const xOffset = Math.floor((blockCanvas.width - shapeWidth) / 2);  
    const yOffset = Math.floor((blockCanvas.height - shapeHeight) / 2);

    
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                blockCtx.fillStyle = currentPiece.color;
                blockCtx.fillRect(xOffset + col * blockSize, yOffset + row * blockSize, blockSize, blockSize);
                blockCtx.strokeRect(xOffset + col * blockSize, yOffset + row * blockSize, blockSize, blockSize);
            }
        }
    }
}

function dropPiece() {
    if (canMove(0, 1)) {
        currentY++;
    } else {
        mergePiece();
        clearLines();
        spawnPiece();
    }
    drawGame();
}

function movePiece(dx) {
    if (canMove(dx, 0)) {
        currentX += dx;
    }
    drawGame();
}

function rotatePiece() {
    const shape = currentPiece.shape.map((row, y) =>
        row.map((_, x) => currentPiece.shape[currentPiece.shape.length - x - 1][y])
    );

    const prevShape = currentPiece.shape;
    currentPiece.shape = shape;
    if (!canMove(0, 0)) { 
        currentPiece.shape = prevShape;
        drawGame();
    }
}

function drawGame() {
    drawBoard();
    drawPiece();
}

document.getElementById("restartButton").addEventListener("click", resetGame);

document.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "ArrowLeft":
            movePiece(-1); 
            break;
        case "ArrowRight":
            movePiece(1); 
            break;
        case "ArrowDown":
            dropPiece(); 
            break;
        case "ArrowUp":
            rotatePiece(); 
            break;
    }
    drawGame();
});

spawnPiece();
setInterval(dropPiece, 500); 
