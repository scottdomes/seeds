import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const OCCUPIED_X = {};

const NUMBER_OF_SEEDS = 6;
const SEED_SIZE = 1;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const BRANCH_PROBABILITY = 6;
const DIRECTIONS = {
  UP: [0, SEED_SIZE],
  UPLEFT: [-SEED_SIZE, SEED_SIZE],
  UPRIGHT: [SEED_SIZE, SEED_SIZE],
  LEFT: [-SEED_SIZE, 0],
  RIGHT: [SEED_SIZE, 0],
};

const pickANewDirection = (oldDirectionKey) => {
  const keys = Object.keys(DIRECTIONS);
  const randomInt = randomIntFromInterval(0, keys.length - 1);
  const randomKey = keys[randomInt];
  if (oldDirectionKey === randomKey) {
    return pickANewDirection(oldDirectionKey);
  } else {
    return randomKey;
  }
};

const randomizeDirection = (oldDirectionKey) => {
  const keys = Object.keys(DIRECTIONS);
  const index = keys.findIndex((key) => key === oldDirectionKey);
  const variance = randomIntFromInterval(-1, 1);
  const newIndex = index + variance;
  if (newIndex === -1 || newIndex === keys.length) {
    return keys[keys.length - 1];
  }
  return keys[index + variance];
};

const findNewCoordinates = (x, y, direction) => {
  return {
    x: x + DIRECTIONS[direction][0],
    y: y + DIRECTIONS[direction][1],
  };
};

const grow = (branch) => {
  const newBranch = { ...branch };
  if (branch.attempts > 2) {
    return null;
  }

  if (branch.hitObstacle) {
    newBranch.direction = pickANewDirection(branch.direction);
  } else {
    console.log(branch.direction);
    newBranch.direction = randomizeDirection(branch.direction);
    console.log(newBranch.direction, newBranch);
  }

  const newCoordinates = findNewCoordinates(
    branch.x,
    branch.y,
    branch.direction
  );

  const isOccupied = checkForOccupation(newCoordinates.x, newCoordinates.y);

  if (isOccupied) {
    newBranch.attempts = branch.attempts + 1;
    newBranch.hitObstacle = true;
    return grow(newBranch);
  } else {
    noteOccupation(newCoordinates.x, newCoordinates.y);
    newBranch.hitObstacle = false;
    newBranch.attempts = 0;
    newBranch.x = newCoordinates.x;
    newBranch.y = newCoordinates.y;
    return newBranch;
  }
};

const growAllBranches = (branches) => {
  const newBranches = [];
  branches.forEach((branch) => {
    newBranches.push(grow(branch));

    if (shouldBranch()) {
      const branchToBe = {
        ...branch,
        attempts: 0,
        hitObstacle: false,
        color: getRandomColor("#964B00"),
      };
      const newBranch = grow(branchToBe);
      newBranches.push(newBranch);
    }
  });

  return newBranches.filter(Boolean);
};

function getRandomColor(color) {
  var p = 1,
    temp,
    random = Math.random(),
    result = "#";

  while (p < color.length) {
    temp = parseInt(color.slice(p, (p += 2)), 16);
    temp += Math.floor((255 - temp) * random);
    result += temp.toString(16).padStart(2, "0");
  }
  return result;
}

const shouldBranch = () => {
  return randomIntFromInterval(1, BRANCH_PROBABILITY) === 1;
};

const generateStartXPoint = (existing) => {
  const startX = randomIntFromInterval(0, 300);
  if (
    existing[startX] ||
    existing[startX + 1] ||
    existing[startX - 1] ||
    existing[startX + 2] ||
    existing[startX - 2]
  ) {
    return generateStartXPoint(existing);
  } else {
    existing[startX] = startX;
    return startX;
  }
};

const createSeeds = () => {
  const startXPoints = {};
  return Array(NUMBER_OF_SEEDS)
    .fill()
    .map((seed, i) => {
      const startX = generateStartXPoint(startXPoints);
      return {
        id: i,
        x: startX,
        y: 0,
        attempts: 0,
        hitObstacle: false,
        direction: "UP",
        color: "#964B00",
      };
    });
};

const drawBranches = (canvas, branches) => {
  const context = canvas.getContext("2d");
  branches.forEach((branch) => {
    context.fillStyle = branch.color;
    context.fillRect(branch.x, canvas.height - branch.y, SEED_SIZE, SEED_SIZE);
  });
};

const checkForOccupation = (x, y) => {
  return OCCUPIED_X[x] && OCCUPIED_X[x].includes(y);
};

const noteOccupation = (x, y) => {
  if (OCCUPIED_X[x]) {
    OCCUPIED_X[x].push(y);
  } else {
    OCCUPIED_X[x] = [y];
  }
};

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const seeds = createSeeds();
  const [isPaused, setPaused] = useState(false);
  let branches = [];
  let interval = null;

  const pause = () => {
    clearInterval(interval);
    setPaused(true);
  };

  const unpause = () => {
    const canvas = canvasRef.current;
    startGame(canvas);
    setPaused(false);
  };

  const startGame = (canvas) => {
    interval = setInterval(() => {
      // const newBranches = [];

      // branches.forEach((branch) => {
      //   if (shouldBranch()) {
      //     const newBranch = calculateNextX(calculateNextY(branch));
      //     newBranch.color = getRandomColor("#964B00");

      //     const isOccupied = checkForOccupation(newBranch.x, newBranch.y);
      //     if (!isOccupied) {
      //       noteOccupation(newBranch.x, newBranch.y);
      //       newBranches.push(newBranch);
      //     } else {
      //       console.log("COLLISION");
      //     }
      //   }

      //   const newX = branch.x + growthAmount();
      //   const newY = branch.y + SEED_SIZE;

      //   const isOccupied = checkForOccupation(newX, newY);

      //   if (!isOccupied) {
      //     noteOccupation(newX, newY);
      //     newBranches.push({
      //       startX: branch.startX,
      //       y: branch.y + SEED_SIZE,
      //       x: branch.x + growthAmount(),
      //       xDirection: randomDirection(),
      //       yDirection: randomDirection(),
      //       color: branch.color,
      //     });
      //   }
      // });
      const newBranches = growAllBranches(branches);

      drawBranches(canvas, newBranches);

      branches = newBranches;
    }, 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    //Our first draw
    seeds.forEach((seed) => {
      context.fillStyle = "#000000";
      context.fillRect(
        seed.startX,
        canvas.height - SEED_SIZE,
        SEED_SIZE,
        SEED_SIZE
      );
    });

    branches = seeds;

    startGame(canvas);
  }, []);

  return (
    <div>
      <button onClick={isPaused ? unpause : pause}>
        {isPaused ? "Resume" : "Pause"}
      </button>
      <canvas
        style={{ height: CANVAS_HEIGHT, width: CANVAS_WIDTH }}
        ref={canvasRef}
        {...props}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Canvas />
    </div>
  );
}

export default App;
