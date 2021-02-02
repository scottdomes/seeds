import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const areBranchesAbove = (x, y) => {
  if (!OCCUPIED_X[x]) {
    return false;
  }

  return Boolean(OCCUPIED_X[x].find((coordinate) => coordinate > y));
};

const findDirectionsTowardTheSun = (x, y) => {
  const canGoUp = !areBranchesAbove(x, y);
  const canGoRight = !areBranchesAbove(x + 1, y);
  const canGoLeft = !areBranchesAbove(x - 1, y);

  const availableDirections = [];

  if (canGoUp) {
    availableDirections.push("UP");
  }

  if (canGoLeft) {
    availableDirections.push("UPLEFT");
    availableDirections.push("LEFT");
  }

  if (canGoRight) {
    availableDirections.push("UPRIGHT");
    availableDirections.push("RIGHT");
  }

  return availableDirections;
};

const findUnoccupiedDirections = (x, y, directions) => {
  return directions.filter((direction) => {
    return !isSpaceOccupied(findNewCoordinates(x, y, direction));
  });
};

const isSurroundingSpaceOccupied = (x, y) => {
  const surroundingPoints = Object.keys(DIRECTIONS).map((direction) => {
    if (isSpaceOccupied(findNewCoordinates(x, y, direction))) {
      return true;
    } else {
      return false;
    }
  });

  return surroundingPoints.filter(Boolean).length > 0;
};

const findUnclaustrophobicDirections = (x, y, directions) => {
  return directions.filter((direction) => {
    return !isSurroundingSpaceOccupied(findNewCoordinates(x, y, direction));
  });
};

const pickRandomItemFromArray = (array) => {
  return array[randomIntFromInterval(0, array.length - 1)];
};

export const pickDirection = (x, y) => {
  const availableDirectionsFromSun = findDirectionsTowardTheSun(x, y);

  if (availableDirectionsFromSun.length === 0) {
    return null;
  }

  const unoccupiedDirections = findUnoccupiedDirections(
    x,
    y,
    availableDirectionsFromSun
  );

  if (unoccupiedDirections.length === 0) {
    return null;
  }

  // const unclaustrophobicDirections = findUnclaustrophobicDirections(
  //   x,
  //   y,
  //   unoccupiedDirections
  // );

  // if (unclaustrophobicDirections.length === 0) {
  //   return null;
  // }

  const diagonalDirections = unoccupiedDirections.filter(
    (direction) => direction === "UPLEFT" || direction === "UPRIGHT"
  );

  if (diagonalDirections.length > 0) {
    return pickRandomItemFromArray(diagonalDirections);
  } else {
    return pickRandomItemFromArray(unoccupiedDirections);
  }
};

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

const findNewCoordinates = (x, y, direction) => {
  return {
    x: x + DIRECTIONS[direction][0],
    y: y + DIRECTIONS[direction][1],
  };
};

const grow = (branch) => {
  const newBranch = { ...branch };

  newBranch.direction = pickDirection(branch.x, branch.y);

  if (!newBranch.direction) {
    return null;
  }

  const newCoordinates = findNewCoordinates(
    branch.x,
    branch.y,
    newBranch.direction
  );

  // const isOccupied = isSpaceOccupied(newCoordinates.x, newCoordinates.y);

  // if (isOccupied) {
  //   return null;
  // }

  noteOccupation(newCoordinates.x, newCoordinates.y);
  newBranch.x = newCoordinates.x;
  newBranch.y = newCoordinates.y;
  return newBranch;
  // }
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

const isSpaceOccupied = (x, y) => {
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
      const newBranches = growAllBranches(branches);

      drawBranches(canvas, newBranches);

      branches = newBranches;
    }, 100);
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
