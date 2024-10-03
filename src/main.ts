// Imports Required
import kaplay from "kaplay";
import "kaplay/global";

// Variables
let JUMP_FORCE = 300;
let SPEED = 450;
const GRAVITY = 700;

/**
 * Returns random element from arry
 */
const getRandomElementFromArray = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];

// Initialize Kaplay
kaplay({
  background: [0, 0, 255],
  font: "VT323",
});

// Loading Assets
loadSprite("plane", "/Plane.png");
loadSprite("tower", "/Tower.png");

// Loading sound effect
loadSound("crash", "/crash.mp3");

// Loading Fonts
loadFont("VT323", "/VT323-Regular.ttf");

/**
 * Scene #1: Gameplay
 */
scene("game", () => {
  // Adding Gravity to Objects
  setGravity(GRAVITY);

  // Adding plane to game
  const Plane = add([
    scale(0.07),
    sprite("plane"),
    pos(80, height() / 2),
    area(),
    body(),
  ]);

  // Areas to prevent player go out of screen
  add([
    rect(width(), 0, { fill: false }),
    pos(0, height()),
    anchor("botleft"),
    area(),
    color(32, 334, 55),
    body({ isStatic: true }),
    "basement",
  ]);
  add([
    rect(width(), 0, { fill: false }),
    pos(0, 0),
    anchor("top"),
    area(),
    body({ isStatic: true }),
    "topment",
  ]);

  /**
   * Make plane fly
   */
  const flyPlane = () => Plane.jump(JUMP_FORCE);

  // Configuring controls for making plane fly
  onClick(flyPlane);
  onKeyPress("space", flyPlane);
  onKeyPress("enter", flyPlane);

  /**
   * Randomly spans tower to game
   */
  const spawnTowers = () => {
    const tower_height = rand(height() / 4, height() / 2.2);
    const tower_placement = getRandomElementFromArray([
      0,
      height() - tower_height,
    ]);
    add([
      scale(0.2, 1),
      sprite("tower"),
      area(),
      pos(width(), tower_placement),
      anchor("top"),
      color(255, 180, 255),
      move(LEFT, SPEED),
      "tower",
    ]);
    add([
      scale(0.2, 1),
      sprite("tower"),
      area(),
      pos(width() + 48, tower_placement),
      anchor("top"),
      color(255, 180, 255),
      move(LEFT, SPEED),
      "tower",
    ]);
    // Loop for next tower at random interval
    wait(rand(0.15, 0.7), spawnTowers);
  };

  // Start spawning random towers
  spawnTowers();

  /**
   * Function to be called when plne crash by any means
   */
  const managePlaneCrashed = () => {
    play("crash");
    addKaboom(Plane.pos);
    setTimeout(() => go("over", score), 100);
  };

  // Confguring places where plane would crash
  Plane.onCollide("tower", managePlaneCrashed);
  Plane.onCollide("basement", managePlaneCrashed);
  Plane.onCollide("topment", managePlaneCrashed);

  // Tracking score as time span plane survive
  let score = 0;

  /**
   * Label to display plane score
   */
  const scoreLabel = add([
    text(`Score: ${score.toString()}`, {
      size: 50,
    }),
    pos(24, 24),
  ]);

  // Incrementing score at every frame
  onUpdate(() => {
    score++;
    scoreLabel.text = `Score: ${score.toString()}`;

    // Extra difficulty
    if (score == 300) {
      setGravity(GRAVITY + 100);
      JUMP_FORCE -= 50;
      SPEED += 50;
    }
  });
});

/**
 * Scene #2: Game Over Screen
 */
scene("over", (score) => {
  // Setup highest score
  try {
    const h_score = localStorage.getItem("highestScore") ?? 0;
    localStorage.setItem("highestScore", h_score > score ? h_score : score);
  } catch {
    console.warn("Failed to save highest score!");
  }

  // Getting highest score
  const h_score = localStorage.getItem("highestScore") ?? score;

  // Displaying plane
  add([
    sprite("plane"),
    pos(width() / 2, height() / 2 - 80),
    scale(0.2),
    anchor("center"),
  ]);

  // Displaying score
  add([
    text(`Your Score: ${score}`, { size: 25 }),
    pos(width() / 2, height() / 2 + 80),
    scale(3),
    anchor("center"),
  ]);

  // Displaying Highest score
  add([
    text(`Highest Score: ${h_score}`, { size: 14, letterSpacing: -0.2 }),
    pos(width() / 2, height() / 2 + 160),
    scale(2),
    anchor("center"),
  ]);

  // Reset Game
  onClick(() => go("game"));
  onKeyPress("space", () => go("game"));
  onKeyPress("enter", () => go("game"));
});

/**
 * Landing user to specific screen
 */
go("game");
