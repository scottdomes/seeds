const SEED_SIZE = 1;

export const growAllTrees = (seeds) => {
  return seeds.map((seed) => {
    return {
      ...seed,
      height: seed.height + 1,
      width: seed.width + 0.1,
      branches: growAllBranches(seed),
    };
  });
};

const growAllBranches = (tree) => {
  if (tree.height % 5 === 0) {
    tree.branches.push({
      y: tree.height,
      height: 1,
      width: 1,
      direction: "LEFT",
    });
    tree.branches.push({
      y: tree.height,
      height: 1,
      width: 1,
      direction: "RIGHT",
    });
  }

  return tree.branches.map((branch) => {
    if (branch.width < 50) {
      return {
        ...branch,
        height: branch.height + 0.001,
        width: branch.width + 1,
      };
    } else {
      return branch;
    }
  });
};

export const drawTrees = (trees, canvas) => {
  const context = canvas.getContext("2d");

  trees.forEach((tree) => {
    context.fillStyle = tree.color;
    context.fillRect(
      tree.x - tree.width / 2,
      canvas.height - tree.height,
      tree.width,
      tree.height
    );

    tree.branches.forEach((branch) => {
      context.fillRect(
        branch.direction === "LEFT" ? tree.x : tree.x - branch.width,
        canvas.height - branch.y / 2,
        branch.width,
        branch.height
      );
    });
  });
};
