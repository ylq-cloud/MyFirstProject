// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const upButton = document.getElementById('up');
const leftButton = document.getElementById('left');
const downButton = document.getElementById('down');
const rightButton = document.getElementById('right');

// 设置画布大小
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

// 游戏变量
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let gameSpeed = INITIAL_SPEED;
let gameInterval = null;
let isGameOver = false;
let isGameRunning = false;

// 初始化游戏
function initGame() {
    // 重置蛇的位置和长度
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    isGameOver = false;
    isGameRunning = false;
    
    // 更新按钮状态
    startButton.disabled = false;
    restartButton.disabled = true;
    
    // 绘制初始游戏状态
    drawGame();
}

// 生成食物
function generateFood() {
    // 随机生成食物位置，确保不在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 移动蛇
function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    
    // 更新方向
    direction = nextDirection;
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新的头部添加到蛇的身体
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 生成新的食物
        generateFood();
        
        // 随着分数增加，提高游戏速度
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            if (isGameRunning) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        }
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 检查碰撞
function checkCollision(head) {
    // 检查是否撞到墙壁
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 检查是否撞到自己的身体
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景（可选）
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4caf50' : '#8bc34a';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // 绘制蛇头的眼睛
        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = CELL_SIZE / 5;
            const eyeOffset = CELL_SIZE / 3;
            
            if (direction === 'right') {
                ctx.beginPath();
                ctx.arc(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'left') {
                ctx.beginPath();
                ctx.arc(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'up') {
                ctx.beginPath();
                ctx.arc(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'down') {
                ctx.beginPath();
                ctx.arc(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    // 如果游戏结束，显示游戏结束信息
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// 游戏循环
function gameLoop() {
    moveSnake();
    drawGame();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    clearInterval(gameInterval);
    drawGame();
    startButton.disabled = true;
    restartButton.disabled = false;
}

// 开始游戏
function startGame() {
    if (!isGameRunning && !isGameOver) {
        isGameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
        startButton.disabled = true;
        restartButton.disabled = false;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 按钮事件
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', initGame);
    
    // 控制按钮事件
    upButton.addEventListener('click', () => {
        if (direction !== 'down') {
            nextDirection = 'up';
        }
    });
    leftButton.addEventListener('click', () => {
        if (direction !== 'right') {
            nextDirection = 'left';
        }
    });
    downButton.addEventListener('click', () => {
        if (direction !== 'up') {
            nextDirection = 'down';
        }
    });
    rightButton.addEventListener('click', () => {
        if (direction !== 'left') {
            nextDirection = 'right';
        }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
            case ' ': // 空格键开始游戏
                e.preventDefault();
                if (!isGameRunning && !isGameOver) {
                    startGame();
                }
                break;
            case 'r': // R键重新开始
                e.preventDefault();
                initGame();
                break;
        }
    });
}

// 初始化游戏和设置事件监听器
initGame();
setupEventListeners();