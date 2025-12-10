import { useEffect, useRef, useState, useCallback } from "react";

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    type: 'falling' | 'rising' | 'horizontal' | 'diagonal';
    color: string;
}

export default function DinoGame({ onClose }: { onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameStateRef = useRef({
        birdX: 50,
        birdY: 100,
        birdVelocity: 0,
        obstacles: [] as Obstacle[],
        gameSpeed: 3,
        lastObstacleTime: 0,
        animationId: 0,
    });

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 300;
    const BIRD_SIZE = 30;
    const MOVE_SPEED = 4;

    const keysPressedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawBird = (x: number, y: number) => {
            // 새 몸체
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.ellipse(x + BIRD_SIZE / 2, y + BIRD_SIZE / 2, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 새 부리
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(x + BIRD_SIZE, y + BIRD_SIZE / 2);
            ctx.lineTo(x + BIRD_SIZE + 8, y + BIRD_SIZE / 2 - 3);
            ctx.lineTo(x + BIRD_SIZE + 8, y + BIRD_SIZE / 2 + 3);
            ctx.closePath();
            ctx.fill();
            
            // 새 눈
            ctx.fillStyle = "#1f2937";
            ctx.beginPath();
            ctx.arc(x + BIRD_SIZE / 2 + 5, y + BIRD_SIZE / 2 - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 날개
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.ellipse(x + BIRD_SIZE / 2 - 5, y + BIRD_SIZE / 2, BIRD_SIZE / 3, BIRD_SIZE / 2, -0.3, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawNote = (x: number, y: number, size: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(angle);
            
            // 음표 머리 (타원형)
            ctx.fillStyle = color;
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -size * 0.3, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 음표 줄기
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 0.08;
            ctx.beginPath();
            ctx.moveTo(size * 0.15, -size * 0.1);
            ctx.lineTo(size * 0.15, size * 0.4);
            ctx.stroke();
            
            // 음표 깃발 (8분음표)
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(size * 0.15, size * 0.4);
            ctx.quadraticCurveTo(size * 0.3, size * 0.35, size * 0.4, size * 0.5);
            ctx.quadraticCurveTo(size * 0.35, size * 0.6, size * 0.2, size * 0.55);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        };

        const drawObstacle = (obstacle: Obstacle) => {
            const centerX = obstacle.x + obstacle.width / 2;
            const centerY = obstacle.y + obstacle.height / 2;
            const size = Math.max(obstacle.width, obstacle.height);
            
            // 이동 방향에 따라 회전 각도 계산
            const angle = Math.atan2(obstacle.vy, obstacle.vx);
            
            drawNote(obstacle.x, obstacle.y, size, angle, obstacle.color);
        };

        const checkCollision = (birdX: number, birdY: number, obstacle: Obstacle): boolean => {
            const birdRadius = BIRD_SIZE / 2;
            const birdCenterX = birdX + birdRadius;
            const birdCenterY = birdY + birdRadius;
            
            // 음표 중심과의 거리 기반 충돌 검사 (간단한 원형 충돌)
            const obstacleCenterX = obstacle.x + obstacle.width / 2;
            const obstacleCenterY = obstacle.y + obstacle.height / 2;
            const obstacleRadius = Math.max(obstacle.width, obstacle.height) / 2;
            const distance = Math.sqrt(
                Math.pow(birdCenterX - obstacleCenterX, 2) + 
                Math.pow(birdCenterY - obstacleCenterY, 2)
            );
            return distance < birdRadius + obstacleRadius;
        };

        const gameLoop = () => {
            if (gameOver) return;

            const state = gameStateRef.current;
            const canvas = canvasRef.current;
            if (!canvas || !ctx) return;

            // 화면 지우기
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 배경 (하늘)
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#87ceeb");
            gradient.addColorStop(1, "#e0f2fe");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 새 이동 (비행기처럼 자유롭게)
            if (keysPressedRef.current.has("ArrowUp") || keysPressedRef.current.has(" ") || keysPressedRef.current.has("Space")) {
                state.birdY = Math.max(0, state.birdY - MOVE_SPEED);
            }
            if (keysPressedRef.current.has("ArrowDown")) {
                state.birdY = Math.min(CANVAS_HEIGHT - BIRD_SIZE, state.birdY + MOVE_SPEED);
            }
            if (keysPressedRef.current.has("ArrowLeft")) {
                state.birdX = Math.max(0, state.birdX - MOVE_SPEED);
            }
            if (keysPressedRef.current.has("ArrowRight")) {
                state.birdX = Math.min(CANVAS_WIDTH - BIRD_SIZE, state.birdX + MOVE_SPEED);
            }

            // 새 그리기
            drawBird(state.birdX, state.birdY);

            // 장애물 생성 (난이도에 따라 빈도 증가)
            const now = Date.now();
            const spawnInterval = Math.max(800 - (score / 10), 300); // 점수가 높을수록 더 자주 생성
            if (now - state.lastObstacleTime > spawnInterval) {
                const obstacleType = Math.random();
                let newObstacle: Obstacle;
                
                if (obstacleType < 0.3) {
                    // 위에서 떨어지는 장애물
                    const size = 20 + Math.random() * 20;
                    newObstacle = {
                        id: now,
                        x: Math.random() * (canvas.width - size),
                        y: -size,
                        width: size,
                        height: size,
                        vx: (Math.random() - 0.5) * 2,
                        vy: 2 + Math.random() * 2 + state.gameSpeed * 0.3,
                        type: 'falling',
                        color: "#ef4444"
                    };
                } else if (obstacleType < 0.5) {
                    // 아래에서 올라오는 장애물
                    const size = 20 + Math.random() * 20;
                    newObstacle = {
                        id: now,
                        x: Math.random() * (canvas.width - size),
                        y: canvas.height,
                        width: size,
                        height: size,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -(2 + Math.random() * 2 + state.gameSpeed * 0.3),
                        type: 'rising',
                        color: "#f59e0b"
                    };
                } else if (obstacleType < 0.8) {
                    // 오른쪽에서 왼쪽으로 날아오는 장애물
                    newObstacle = {
                        id: now,
                        x: canvas.width,
                        y: Math.random() * (canvas.height - 40),
                        width: 30 + Math.random() * 20,
                        height: 30 + Math.random() * 20,
                        vx: -(3 + Math.random() * 2 + state.gameSpeed * 0.5),
                        vy: (Math.random() - 0.5) * 1.5,
                        type: 'horizontal',
                        color: "#8b5cf6"
                    };
                } else {
                    // 대각선으로 날아오는 장애물
                    const side = Math.random();
                    if (side < 0.5) {
                        // 위에서 대각선
                        newObstacle = {
                            id: now,
                            x: canvas.width,
                            y: -30,
                            width: 25 + Math.random() * 15,
                            height: 25 + Math.random() * 15,
                            vx: -(3 + Math.random() * 2 + state.gameSpeed * 0.5),
                            vy: 2 + Math.random() * 2,
                            type: 'diagonal',
                            color: "#10b981"
                        };
                    } else {
                        // 아래에서 대각선
                        newObstacle = {
                            id: now,
                            x: canvas.width,
                            y: canvas.height,
                            width: 25 + Math.random() * 15,
                            height: 25 + Math.random() * 15,
                            vx: -(3 + Math.random() * 2 + state.gameSpeed * 0.5),
                            vy: -(2 + Math.random() * 2),
                            type: 'diagonal',
                            color: "#06b6d4"
                        };
                    }
                }
                
                state.obstacles.push(newObstacle);
                state.lastObstacleTime = now;
            }

            // 장애물 이동 및 충돌 검사
            state.obstacles = state.obstacles.filter((obstacle) => {
                obstacle.x += obstacle.vx;
                obstacle.y += obstacle.vy;

                // 충돌 검사
                if (checkCollision(state.birdX, state.birdY, obstacle)) {
                    setGameOver(true);
                    return false;
                }

                // 화면 밖으로 나간 장애물 제거
                return (
                    obstacle.x + obstacle.width > -50 &&
                    obstacle.x < canvas.width + 50 &&
                    obstacle.y + obstacle.height > -50 &&
                    obstacle.y < canvas.height + 50
                );
            });

            // 장애물 그리기
            state.obstacles.forEach((obstacle) => {
                drawObstacle(obstacle);
            });

            // 점수 증가
            setScore((prev) => prev + 1);

            // 게임 속도 증가 (더 빠르게)
            if (score % 50 === 0 && score > 0) {
                state.gameSpeed = Math.min(state.gameSpeed + 0.15, 10);
            }

            state.animationId = requestAnimationFrame(gameLoop);
        };

        // 키보드 이벤트
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                keysPressedRef.current.add(e.code);
                if (e.key === " ") {
                    keysPressedRef.current.add("Space");
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                keysPressedRef.current.delete(e.code);
                if (e.key === " ") {
                    keysPressedRef.current.delete("Space");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // 게임 시작
        const animationId = requestAnimationFrame(gameLoop);
        gameStateRef.current.animationId = animationId;

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (gameStateRef.current.animationId) {
                cancelAnimationFrame(gameStateRef.current.animationId);
            }
        };
    }, [score, gameOver]);

    const handleRestart = () => {
        setGameOver(false);
        setScore(0);
        keysPressedRef.current.clear();
        gameStateRef.current = {
            birdX: 50,
            birdY: 100,
            birdVelocity: 0,
            obstacles: [],
            gameSpeed: 3,
            lastObstacleTime: 0,
            animationId: 0,
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ×
                </button>

                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">새 게임</h2>
                    <p className="text-sm text-[var(--text-muted)]">화살표 키로 자유롭게 이동하며 날아오는 음표를 피하세요!</p>
                </div>

                <div className="relative bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-300">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="w-full h-auto block"
                    />
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <div className="text-center text-white">
                                <h3 className="text-4xl font-bold mb-4">게임 오버!</h3>
                                <p className="text-2xl mb-6">점수: {score}</p>
                                <button
                                    onClick={handleRestart}
                                    className="px-8 py-3 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    다시 시작
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">점수: {score}</p>
                </div>
            </div>
        </div>
    );
}

