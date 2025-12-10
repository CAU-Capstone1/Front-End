import { useEffect, useRef, useState } from "react";

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
    const [showBubble, setShowBubble] = useState(false);
    const [showPingBubble, setShowPingBubble] = useState(false);
    const [showMasterBubble, setShowMasterBubble] = useState(false);
    const [showEasyBubble, setShowEasyBubble] = useState(false);
    const [friendBirdX, setFriendBirdX] = useState(-100); // 친구 새 X 위치
    const [friendBirdY, setFriendBirdY] = useState(0); // 친구 새 Y 위치
    const [showFriendBird, setShowFriendBird] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const gameStateRef = useRef({
        birdX: 50,
        birdY: 100,
        birdVelocity: 0,
        obstacles: [] as Obstacle[],
        gameSpeed: 3,
        lastObstacleTime: 0,
        animationId: 0,
        spacePressed: false,
        teleportScore: 0, // 순간이동 시점의 점수
    });

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    const BIRD_SIZE = 40;
    const MOVE_SPEED = 6;

    const keysPressedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawCloud = (x: number, y: number, size: number) => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            // 구름을 여러 원으로 그리기
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
            ctx.arc(x + size * 1.2, y, size * 0.5, 0, Math.PI * 2);
            ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
            ctx.arc(x + size * 0.9, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawGreenBird = (x: number, y: number) => {
            const centerX = x + BIRD_SIZE / 2;
            const centerY = y + BIRD_SIZE / 2;
            
            // 연두색 병아리 몸체 (둥근 원)
            ctx.fillStyle = "#a8e063"; // 연두색
            ctx.beginPath();
            ctx.arc(centerX, centerY, BIRD_SIZE * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // 몸체 테두리
            ctx.strokeStyle = "#86c440";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 날개 (한쪽에 곡선)
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX - BIRD_SIZE * 0.15, centerY, BIRD_SIZE * 0.25, 0, Math.PI);
            ctx.stroke();
            
            // 병아리 눈 (작은 검은 점)
            ctx.fillStyle = "#1f2937";
            ctx.beginPath();
            ctx.arc(centerX + BIRD_SIZE * 0.15, centerY - BIRD_SIZE * 0.1, BIRD_SIZE * 0.05, 0, Math.PI * 2);
            ctx.fill();
            
            // 부리 (작은 주황색 삼각형)
            ctx.fillStyle = "#fb923c"; // 주황색
            ctx.beginPath();
            ctx.moveTo(centerX + BIRD_SIZE * 0.35, centerY - BIRD_SIZE * 0.05);
            ctx.lineTo(centerX + BIRD_SIZE * 0.45, centerY);
            ctx.lineTo(centerX + BIRD_SIZE * 0.35, centerY + BIRD_SIZE * 0.05);
            ctx.closePath();
            ctx.fill();
            
            // 다리 (작은 막대기)
            ctx.strokeStyle = "#a8e063";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.35);
            ctx.lineTo(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45);
            ctx.moveTo(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.35);
            ctx.lineTo(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45);
            ctx.stroke();
            
            // 발 (작은 원)
            ctx.fillStyle = "#a8e063";
            ctx.beginPath();
            ctx.arc(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45, BIRD_SIZE * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45, BIRD_SIZE * 0.04, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawBird = (x: number, y: number, facingLeft: boolean) => {
            const centerX = x + BIRD_SIZE / 2;
            const centerY = y + BIRD_SIZE / 2;
            const direction = facingLeft ? -1 : 1; // -1이면 왼쪽, 1이면 오른쪽
            
            // 병아리 몸체 (둥근 원)
            ctx.fillStyle = "#fef08a"; // 밝은 노란색
            ctx.beginPath();
            ctx.arc(centerX, centerY, BIRD_SIZE * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // 몸체 테두리
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 날개 (한쪽에 곡선) - 방향에 따라 반대쪽
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX - BIRD_SIZE * 0.15 * direction, centerY, BIRD_SIZE * 0.25, 0, Math.PI);
            ctx.stroke();
            
            // 병아리 눈 (작은 검은 점) - 방향에 따라 반대쪽
            ctx.fillStyle = "#1f2937";
            ctx.beginPath();
            ctx.arc(centerX + BIRD_SIZE * 0.15 * direction, centerY - BIRD_SIZE * 0.1, BIRD_SIZE * 0.05, 0, Math.PI * 2);
            ctx.fill();
            
            // 부리 (작은 주황색 삼각형) - 방향에 따라 반대쪽
            ctx.fillStyle = "#fb923c"; // 주황색
            ctx.beginPath();
            if (facingLeft) {
                ctx.moveTo(centerX - BIRD_SIZE * 0.35, centerY - BIRD_SIZE * 0.05);
                ctx.lineTo(centerX - BIRD_SIZE * 0.45, centerY);
                ctx.lineTo(centerX - BIRD_SIZE * 0.35, centerY + BIRD_SIZE * 0.05);
            } else {
                ctx.moveTo(centerX + BIRD_SIZE * 0.35, centerY - BIRD_SIZE * 0.05);
                ctx.lineTo(centerX + BIRD_SIZE * 0.45, centerY);
                ctx.lineTo(centerX + BIRD_SIZE * 0.35, centerY + BIRD_SIZE * 0.05);
            }
            ctx.closePath();
            ctx.fill();
            
            // 다리 (작은 막대기)
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.35);
            ctx.lineTo(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45);
            ctx.moveTo(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.35);
            ctx.lineTo(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45);
            ctx.stroke();
            
            // 발 (작은 원)
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(centerX - BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45, BIRD_SIZE * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + BIRD_SIZE * 0.15, centerY + BIRD_SIZE * 0.45, BIRD_SIZE * 0.04, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawSpeechBubble = (x: number, y: number, text: string) => {
            ctx.save();
            
            // 텍스트 길이에 따라 말풍선 크기 조정
            ctx.font = "bold 14px sans-serif";
            const textWidth = ctx.measureText(text).width;
            const bubbleWidth = Math.max(120, textWidth + 30);
            const bubbleHeight = 50;
            const bubbleX = x - bubbleWidth / 2;
            const bubbleY = y - BIRD_SIZE - bubbleHeight - 10;
            
            // 말풍선 배경
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
            ctx.fill();
            ctx.stroke();
            
            // 말풍선 꼬리
            ctx.beginPath();
            ctx.moveTo(x - 10, bubbleY + bubbleHeight);
            ctx.lineTo(x, bubbleY + bubbleHeight + 10);
            ctx.lineTo(x + 10, bubbleY + bubbleHeight);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 텍스트
            ctx.fillStyle = "#1f2937";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, x, bubbleY + bubbleHeight / 2);
            
            ctx.restore();
        };

        const drawNote = (x: number, y: number, size: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(angle);
            
            // 음표 머리 (타원형)
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, -size * 0.3, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            
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
            
            ctx.restore();
        };

        const drawObstacle = (obstacle: Obstacle) => {
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
            gradient.addColorStop(0, "#b3e5fc"); // 연한 하늘색
            gradient.addColorStop(0.5, "#c5e8fc"); // 더 연한 하늘색
            gradient.addColorStop(1, "#e1f5fe"); // 매우 연한 하늘색
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 구름 추가
            const time = Date.now() * 0.0005;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            
            // 구름 1
            const cloud1X = (canvas.width * 0.2 + time * 20) % (canvas.width + 100) - 50;
            drawCloud(cloud1X, canvas.height * 0.15, 60);
            
            // 구름 2
            const cloud2X = (canvas.width * 0.6 - time * 15) % (canvas.width + 100) - 50;
            drawCloud(cloud2X, canvas.height * 0.25, 50);
            
            // 구름 3
            const cloud3X = (canvas.width * 0.4 + time * 25) % (canvas.width + 100) - 50;
            drawCloud(cloud3X, canvas.height * 0.1, 45);

            // 새 이동 (비행기처럼 자유롭게)
            if (keysPressedRef.current.has("ArrowUp")) {
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

            // 친구 새 이동 (900~1100점 사이)
            if (showFriendBird) {
                setFriendBirdX((prev) => {
                    const newX = prev + 4; // 오른쪽으로 이동 (속도 증가)
                    if (newX > canvas.width + BIRD_SIZE) {
                        setShowFriendBird(false);
                    }
                    return newX;
                });
            }

            // 새 그리기 (방향에 따라)
            const facingLeft = keysPressedRef.current.has("ArrowLeft") && !keysPressedRef.current.has("ArrowRight");
            drawBird(state.birdX, state.birdY, facingLeft);
            
            // 친구 새 그리기
            if (showFriendBird && friendBirdX >= -BIRD_SIZE && friendBirdX <= canvas.width + BIRD_SIZE) {
                drawGreenBird(friendBirdX, friendBirdY);
                // "안녕~" 말풍선 그리기
                if (friendBirdX > 50 && friendBirdX < canvas.width - 150) {
                    drawSpeechBubble(friendBirdX + BIRD_SIZE / 2, friendBirdY + BIRD_SIZE / 2, "안녕~");
                }
            }

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
            setScore((prev) => {
                const newScore = prev + 1;
                // 600~700점 사이일 때만 말풍선 표시
                if (newScore >= 400 && newScore <= 500) {
                    if (!showBubble) {
                        setShowBubble(true);
                    }
                } else {
                    // 700점을 넘으면 말풍선 숨기기
                    if (showBubble) {
                        setShowBubble(false);
                    }
                }
                
                // 900~1100점 사이에 친구 새 나타나기
                if (newScore >= 700 && newScore <= 850) {
                    if (!showFriendBird) {
                        setShowFriendBird(true);
                        setFriendBirdX(-BIRD_SIZE); // 왼쪽에서 시작
                        setFriendBirdY(canvas.height * 0.3); // 중간 높이
                    }
                } else {
                    // 1100점을 넘으면 친구 새 숨기기
                    if (showFriendBird) {
                        setShowFriendBird(false);
                    }
                }
                
                // 1200~1300점 사이일 때만 "나는 음악의 지배자다" 말풍선 표시
                if (newScore >= 1000 && newScore <= 1100) {
                    if (!showMasterBubble) {
                        setShowMasterBubble(true);
                    }
                } else {
                    // 1300점을 넘으면 말풍선 숨기기
                    if (showMasterBubble) {
                        setShowMasterBubble(false);
                    }
                }
                
                // 1800~1900점 사이일 때만 "이거 너무 쉬운거 아닌가?" 말풍선 표시
                if (newScore >= 1400 && newScore <= 1500) {
                    if (!showEasyBubble) {
                        setShowEasyBubble(true);
                    }
                } else {
                    // 1900점을 넘으면 말풍선 숨기기
                    if (showEasyBubble) {
                        setShowEasyBubble(false);
                    }
                }
                
                // "뿅" 말풍선: 순간이동 후 30점이 오르는 동안 표시
                if (showPingBubble) {
                    const scoreDiff = newScore - state.teleportScore;
                    if (scoreDiff > 30) {
                        setShowPingBubble(false);
                    }
                }
                
                return newScore;
            });

            // 말풍선 그리기
            if (showBubble) {
                const birdCenterX = state.birdX + BIRD_SIZE / 2;
                const birdCenterY = state.birdY + BIRD_SIZE / 2;
                drawSpeechBubble(birdCenterX, birdCenterY, "따분하군...");
            }
            
            // "뿅" 말풍선 그리기
            if (showPingBubble) {
                const birdCenterX = state.birdX + BIRD_SIZE / 2;
                const birdCenterY = state.birdY + BIRD_SIZE / 2;
                drawSpeechBubble(birdCenterX, birdCenterY, "뿅");
            }
            
            // "나는 음악의 지배자다" 말풍선 그리기
            if (showMasterBubble) {
                const birdCenterX = state.birdX + BIRD_SIZE / 2;
                const birdCenterY = state.birdY + BIRD_SIZE / 2;
                drawSpeechBubble(birdCenterX, birdCenterY, "나는 음악의 지배자다");
            }
            
            // "이거 너무 쉬운거 아닌가?" 말풍선 그리기
            if (showEasyBubble) {
                const birdCenterX = state.birdX + BIRD_SIZE / 2;
                const birdCenterY = state.birdY + BIRD_SIZE / 2;
                drawSpeechBubble(birdCenterX, birdCenterY, "이거 너무 쉬운거 아닌가?");
            }

            // 게임 속도 증가 (더 빠르게)
            if (score % 50 === 0 && score > 0) {
                state.gameSpeed = Math.min(state.gameSpeed + 0.15, 10);
            }

            state.animationId = requestAnimationFrame(gameLoop);
        };

        // 키보드 이벤트
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.key === " ") {
                e.preventDefault();
                // 스페이스바를 처음 눌렀을 때만 순간이동
                if (!gameStateRef.current.spacePressed) {
                    gameStateRef.current.spacePressed = true;
                    // 랜덤한 위치로 순간이동
                    gameStateRef.current.birdX = Math.random() * (CANVAS_WIDTH - BIRD_SIZE);
                    gameStateRef.current.birdY = Math.random() * (CANVAS_HEIGHT - BIRD_SIZE);
                    // 순간이동 시점의 점수 저장 및 "뿅" 말풍선 표시
                    gameStateRef.current.teleportScore = score;
                    setShowPingBubble(true);
                }
                keysPressedRef.current.add(e.code);
                if (e.key === " ") {
                    keysPressedRef.current.add("Space");
                }
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                keysPressedRef.current.add(e.code);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.key === " ") {
                e.preventDefault();
                gameStateRef.current.spacePressed = false;
                keysPressedRef.current.delete(e.code);
                if (e.key === " ") {
                    keysPressedRef.current.delete("Space");
                }
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                keysPressedRef.current.delete(e.code);
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
    }, [score, gameOver, showBubble, showPingBubble, showMasterBubble, showEasyBubble, showFriendBird, friendBirdX, friendBirdY]);

    const handleRestart = () => {
        setGameOver(false);
        setScore(0);
        setShowBubble(false);
        setShowPingBubble(false);
        setShowMasterBubble(false);
        setShowEasyBubble(false);
        setShowFriendBird(false);
        setFriendBirdX(-100);
        setFriendBirdY(0);
        keysPressedRef.current.clear();
        gameStateRef.current = {
            birdX: 50,
            birdY: 100,
            birdVelocity: 0,
            obstacles: [],
            gameSpeed: 3,
            lastObstacleTime: 0,
            animationId: 0,
            spacePressed: false,
            teleportScore: 0,
        };
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // 애니메이션 시간과 맞춤
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div 
                className={`relative bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 transition-all duration-300 ${
                    isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ×
                </button>

                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">벌새, 날다</h2>
                    <p className="text-sm text-[var(--text-muted)]">화살표 키로 자유롭게 이동하며 날아오는 음표를 피하세요!</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">스페이스바를 누르면 초능력을 쓸 수 있어요</p>
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

