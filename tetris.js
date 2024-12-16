const gameBoard = document.getElementById('game-board');

// Тоглоомын тохиргоо
const rows = 20;
const cols = 10;
const board = [];

// Талбай үүсгэх
for (let r = 0; r < rows; r++) {
  const row = [];
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gameBoard.appendChild(cell);
    row.push(cell);
  }
  board.push(row);
}

// Блокын хэлбэрүүд
const shapes = [
  [[1, 1, 1], [0, 1, 0]],  // T хэлбэр
  [[1, 1, 0], [0, 1, 1]],  // Z хэлбэр
  [[0, 1, 1], [1, 1, 0]],  // S хэлбэр
  [[1, 1], [1, 1]],        // O хэлбэр
  [[1], [1], [1], [1]],    // I хэлбэр
  [[1, 0, 0], [1, 1, 1]],  // L хэлбэр
  [[0, 0, 1], [1, 1, 1]],  // J хэлбэр
];

// Блок үүсгэх
let currentShape = getRandomShape();
function getRandomShape() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  return { shape, x: 3, y: 0 }; // Эхлэх байрлал
}

// Блокыг зурах
function drawShape() {
  clearBoard();
  currentShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const x = currentShape.x + cIdx;
        const y = currentShape.y + rIdx;
        if (y >= 0 && board[y] && board[y][x]) {
          board[y][x].classList.add('active');
        }
      }
    });
  });
}

// Талбай цэвэрлэх
function clearBoard() {
  board.forEach(row => row.forEach(cell => {
    cell.classList.remove('active');
  }));
}

// Блокыг хөдөлгөх
function moveShape(direction) {
  if (direction === 'down') {
    currentShape.y++;
    if (!isValidPosition()) {
      currentShape.y--; // Боломжгүй бол буцаана
      lockShape(); // Бэхлэх
      currentShape = getRandomShape(); // Шинэ блок
      clearFullRows(); // Мөрийг шалгаж устгах
      checkGameOver(); // Тоглоом дуусахыг шалгах
    }
  } else if (direction === 'left') {
    currentShape.x--;
    if (!isValidPosition()) currentShape.x++;
  } else if (direction === 'right') {
    currentShape.x++;
    if (!isValidPosition()) currentShape.x--;
  }
  drawShape();
}

// Блокыг талбайд бэхлэх
function lockShape() {
  currentShape.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (value) {
        const x = currentShape.x + cIdx;
        const y = currentShape.y + rIdx;
        if (y >= 0 && board[y] && board[y][x]) {
          board[y][x].classList.remove('active');
          board[y][x].classList.add('fixed'); // Блокыг бэхлэх
        }
      }
    });
  });
}

// Хязгаар шалгах
function isValidPosition() {
  return currentShape.shape.every((row, rIdx) => {
    return row.every((value, cIdx) => {
      if (!value) return true;
      const x = currentShape.x + cIdx;
      const y = currentShape.y + rIdx;
      return (
        x >= 0 &&
        x < cols &&
        y < rows &&
        (!board[y] || !board[y][x].classList.contains('fixed'))
      );
    });
  });
}

// Эргүүлэх
function rotateShape() { 
  const newShape = currentShape.shape[0].map((_, cIdx) => 
    currentShape.shape.map(row => row[cIdx]).reverse()
  );

  const originalX = currentShape.x;
  const originalY = currentShape.y;

  currentShape.shape = newShape;

  // Хязгаар давсан тохиолдолд эргүүлэхийг буцаана
  if (!isValidPosition()) {
    currentShape.shape = newShape[0].map((_, cIdx) => 
      newShape.map(row => row[cIdx]).reverse()
    );
    currentShape.x = originalX;
    currentShape.y = originalY;
  }
}

// Мөрийг шалгаж устгах
function clearFullRows() {
  for (let r = rows - 1; r >= 0; r--) {
    if (board[r].every(cell => cell.classList.contains('fixed'))) {
      for (let y = r; y > 0; y--) {
        for (let x = 0; x < cols; x++) {
          board[y][x].className = board[y - 1][x].className;
        }
      }
      for (let x = 0; x < cols; x++) {
        board[0][x].className = 'cell';
      }
      r++; // Устгасан мөрийг дахин шалгах
    }
  }
}

// Тоглоом дуусахыг шалгах
function checkGameOver() {
  if (board[0].some(cell => cell.classList.contains('fixed'))) {
    alert('Тоглоом дууслаа!');
    location.reload();
  }
}

// Товчлуураар удирдах
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') moveShape('left');
  if (event.key === 'ArrowRight') moveShape('right');
  if (event.key === 'ArrowDown') moveShape('down');
  if (event.key === 'ArrowUp') rotateShape(); // Эргүүлэх
});

// Тоглоомыг эхлүүлэх
function startGame() {
  drawShape();
  setInterval(() => {
    moveShape('down');
  }, 200); // 500 мс тутамд хөдөлнө
}

startGame();