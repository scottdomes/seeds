const SEED_SIZE = 1;

export const growAllTrees = (seeds) => {
  return seeds.map((seed) => {
    return {
      ...seed,
      height: seed.height + 1,
      width: seed.width + .1,
    };
  });
};

export const drawTrees = (trees, canvas) => {
  const context = canvas.getContext("2d");

  trees.forEach((tree) => {
    console.log(tree.color);
    context.fillStyle = tree.color;
    console.log(
      tree.startX - tree.width / 2,
      canvas.height - tree.height,
      tree.width,
      tree.height
    );
    context.fillRect(
      tree.x - tree.width / 2,
      canvas.height - tree.height,
      tree.width,
      tree.height
    );
  });
};
