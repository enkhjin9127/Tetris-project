const gameBoard = document.getElementById("game-board");
const nextShapeContainer = document.getElementById("next-shape");

// Тоглоомын тохиргоо
const rows = 20;
const cols = 10;
const board = [];
const nextBoard = [];
let score = 0;
let speed = 400; // Анхны хурд
let gameInterval; // Тоглоомын интервал

// Блокын хэлбэрүүд
const shapes = [
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T хэлбэр
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z хэлбэр
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S хэлбэр
  [
    [1, 1],
    [1, 1],
  ], // O хэлбэр
  [[1], [1], [1], [1]], // I хэлбэр
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // L хэлбэр
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // J хэлбэр
];

// Санамсаргүй өнгө үүсгэх функц
function getRandomColor() {
  const colors = ["#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#e67e22"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Санамсаргүй блок үүсгэх
function getRandomShape() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const color = getRandomColor();
  return { shape, color, x: Math.floor(cols / 2 - shape[0].length / 2), y: 0 };
}

// Одоогийн болон дараагийн блокуудыг үүсгэх
let currentShape = getRandomShape();
let nextShape = getRandomShape();

// Талбай үүсгэх
for (let r = 0; r < rows; r++) {
  const row = [];
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameBoard.appendChild(cell);
    row.push(cell);
  }
  board.push(row);
}

// Дараагийн хэлбэрийн талбар үүсгэх
for (let r = 0; r < 3; r++) {
  const row = [];
  for (let c = 0; c < 3; c++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    nextShapeContainer.appendChild(cell);
    row.push(cell);
  }
  nextBoard.push(row);
}

// Сүүдэр зурах функц
function drawShadow() {
  clearShadow();
  let tempY = currentShape.y;

  while (isValidPosition({ x: currentShape.x, y: tempY + 1, shape: currentShape.shape })) {
    tempY++;
  }

  currentShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const x = currentShape.x + cIdx;
        const y = tempY + rIdx;
        if (y >= 0 && board[y] && board[y][x]) {
          board[y][x].classList.add("shadow");
        }
      }
    });
  });
}

// Сүүдрийг цэвэрлэх
function clearShadow() {
  board.forEach((row) =>
    row.forEach((cell) => {
      cell.classList.remove("shadow");
    })
  );
}

// Блокыг зурах
function drawShape() {
  clearBoard();
  drawShadow();
  currentShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const x = currentShape.x + cIdx;
        const y = currentShape.y + rIdx;
        if (y >= 0 && board[y] && board[y][x]) {
          const cell = board[y][x];
          cell.classList.add("active");
          cell.style.setProperty("--color", currentShape.color);
        }
      }
    });
  });
}

// Талбайг цэвэрлэх
function clearBoard() {
  board.forEach((row) =>
    row.forEach((cell) => {
      cell.classList.remove("active");
    })
  );
}

// Блокыг хөдөлгөх
function moveShape(direction) {
  if (direction === "down") {
    currentShape.y++;
    if (!isValidPosition()) {
      currentShape.y--;
      lockShape();
      currentShape = getNextShape();
      clearFullRows();
      checkGameOver();
    }
  } else if (direction === "left") {
    currentShape.x--;
    if (!isValidPosition()) currentShape.x++;
  } else if (direction === "right") {
    currentShape.x++;
    if (!isValidPosition()) currentShape.x--;
  }
  drawShape();
}
function setSpeed(newSpeed) {
  speed = newSpeed;

  // Хуучин интервалыг зогсооно
  clearInterval(gameInterval);

  // Шинэ хурдтай интервал үүсгэнэ
  gameInterval = setInterval(() => moveShape("down"), speed);
}

// Блокыг талбайд бэхлэх
function lockShape() {
  currentShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const x = currentShape.x + cIdx;
        const y = currentShape.y + rIdx;
        if (y >= 0 && board[y] && board[y][x]) {
          const cell = board[y][x];
          cell.classList.remove("active");
          cell.classList.add("fixed");
          cell.style.setProperty("--color", currentShape.color);
        }
      }
    });
  });
}

// Хязгаар шалгах
function isValidPosition({ x = currentShape.x, y = currentShape.y, shape = currentShape.shape } = {}) {
  return shape.every((row, rIdx) => {
    return row.every((value, cIdx) => {
      if (!value) return true;
      const newX = x + cIdx;
      const newY = y + rIdx;
      return (
        newX >= 0 &&
        newX < cols &&
        newY < rows &&
        (!board[newY] || !board[newY][newX].classList.contains("fixed"))
      );
    });
  });
}

// Мөрийг устгах
function clearFullRows() {
  let rowsCleared = 0;
  for (let r = rows - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell.classList.contains("fixed"))) {
      rowsCleared++;
      for (let y = r; y > 0; y--) {
        for (let x = 0; x < cols; x++) {
          board[y][x].className = board[y - 1][x].className;
          board[y][x].style.cssText = board[y - 1][x].style.cssText;
        }
      }
      for (let x = 0; x < cols; x++) {
        board[0][x].className = "cell";
        board[0][x].style.cssText = "";
      }
      r++;
    }
  }
  updateScore(rowsCleared);
}

// Оноог шинэчлэх
function updateScore(rowsCleared) {
  const points = [0, 100, 300, 500, 800];
  score += points[rowsCleared];
  document.getElementById("score").textContent = score;
}

// Тоглоом дуусахыг шалгах
function checkGameOver() {
  if (board[0].some((cell) => cell.classList.contains("fixed"))) {
    alert("Тоглоом дууслаа!");
    location.reload();
  }
}

// Дараагийн хэлбэрийг авах
function getNextShape() {
  const shape = nextShape;
  nextShape = getRandomShape();
  drawNextShape();
  return shape;
}

// Дараагийн хэлбэрийг зурах
function drawNextShape() {
  nextBoard.forEach((row) =>
    row.forEach((cell) => cell.classList.remove("active"))
  );
  nextShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const cell = nextBoard[rIdx][cIdx];
        cell.classList.add("active");
        cell.style.setProperty("--color", nextShape.color);
      }
    });
  });
}

// Блокыг 90 градус эргүүлэх
function rotateShape() {
  const rotated = currentShape.shape[0].map((_, idx) =>
    currentShape.shape.map((row) => row[idx]).reverse()
  );
  const previousShape = currentShape.shape;
  currentShape.shape = rotated;

  // Байрлал буруу бол буцаана
  if (!isValidPosition()) {
    currentShape.shape = previousShape;
  }
  drawShape();
}

// Тоглоом эхлүүлэх
function startGame() {
  drawShape();
  drawNextShape();
  setInterval(() => moveShape("down"), 400);
}

// Товчлуураар удирдах
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveShape("left");
  else if (event.key === "ArrowRight") moveShape("right");
  else if (event.key === "ArrowDown") moveShape("down");
  else if (event.key === "ArrowUp") rotateShape();
  else if (event.key === " ") {
    while (isValidPosition({ x: currentShape.x, y: currentShape.y + 1 })) {
      currentShape.y++;
    }
    lockShape();
    currentShape = getNextShape();
    clearFullRows();
    checkGameOver();
    drawShape();
  }
});

// Тоглоом эхлүүлэх
function startGame() {
  drawShape();
  drawNextShape();
  setSpeed(speed); // Эхний хурдыг тохируулна
}