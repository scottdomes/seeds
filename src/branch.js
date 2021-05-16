const findNewCoordinates = (x, y, direction) => {
  return {
    x: x + DIRECTIONS[direction][0],
    y: y + DIRECTIONS[direction][1],
  };
};

const areBranchesAbove = (x, y) => {
  if (!OCCUPIED_X[x]) {
    return false;
  }

  return Boolean(OCCUPIED_X.find((coordinate) => coordinate > y));
};

const pickDirection = (x, y, direction) => {
  const options = Object.keys(DIRECTIONS).map((key) => {
    const newCoordinates = findNewCoordinates(x, y, key);

    const isOccupied = checkForOccupation(newCoordinates.x, newCoordinates.y);

    if (isOccupied) {
      return false;
    }

    const hasBranchesAbove = areBranchesAbove(
      newCoordinates.x,
      newCoordinates.y
    );

    const isCurrent = key === direction;

    return {
      isCurrent,
      hasBranchesAbove,
    };
  });
};

const grow = (branch) => {
  const newBranch = { ...branch };

  newBranch.direction = pickDirection(branch.x, branch.y, branch.direction);

  if (!newBranch.direction) {
    return null;
  }

  const newCoordinates = findNewCoordinates(
    branch.x,
    branch.y,
    newBranch.direction
  );

  const isOccupied = checkForOccupation(newCoordinates.x, newCoordinates.y);

  // if (isOccupied) {
  //   return null;
  // }

  // if (isOccupied) {
  //   newBranch.attempts = branch.attempts + 1;
  //   newBranch.hitObstacle = true;
  //   return grow(newBranch);
  // } else {
  noteOccupation(newCoordinates.x, newCoordinates.y);
  newBranch.x = newCoordinates.x;
  newBranch.y = newCoordinates.y;
  return newBranch;
  // }
};
