export const solvedSet = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

export const diff = (rawA, rawB) => {
    // convert to sets if needed
    const a = rawA instanceof Set ? rawA : new Set([...rawA]);
    const b = rawB instanceof Set ? rawB : new Set([...rawB]);

    let aMinusB = new Set([...a].filter((x) => !b.has(x)));
    let bMinusA = new Set([...b].filter((x) => !a.has(x)));

    return new Set([...aMinusB, ...bMinusA]);
};

export const intersection = (...sets) => {
    const uniques = new Set(...sets);

    return [...uniques].filter((val) => {
        return sets.every((set) => set.has(val));
    });
};

export const getRow = (grid, rowIndex) => {
    return [...grid[rowIndex]];
};

export const getCol = (grid, colIndex) => {
    return grid.reduce((colOutput, rowArr) => {
        return colOutput.concat(rowArr[colIndex]);
    }, []);
};

export const getBoundingBox = (grid, rowIndex, colIndex) => {
    const boxSize = 3;
    const topLeft = [];
    const bottomRight = [];

    topLeft[0] = Math.floor(rowIndex / boxSize) * boxSize;
    topLeft[1] = Math.floor(colIndex / boxSize) * boxSize;

    bottomRight[0] = Math.floor(rowIndex / boxSize) * boxSize + (boxSize - 1);
    bottomRight[1] = Math.floor(colIndex / boxSize) * boxSize + (boxSize - 1);

    return [topLeft, bottomRight];
};

export const getSubSquare = (grid, rowIndex, colIndex) => {
    const boundingBox = getBoundingBox(grid, rowIndex, colIndex);
    const [topLeft, bottomRight] = boundingBox;
    const [topLeftRowIndex, topLeftColIndex] = topLeft;
    const [bottomRightRowIndex, bottomRightColIndex] = bottomRight;

    // todo hard-coded to grid size of 3
    return {
        values: [
            grid[topLeftRowIndex].slice(topLeftColIndex, bottomRightColIndex + 1),
            grid[topLeftRowIndex + 1].slice(topLeftColIndex, bottomRightColIndex + 1),
            grid[topLeftRowIndex + 2].slice(topLeftColIndex, bottomRightColIndex + 1)
        ],
        boundingBox
    };
};

export const getBlacklist = (grid, rowIndex, colIndex) => {
    if (isBoxSolved(grid, rowIndex, colIndex)) {
        console.warn(`Position is already solved.`);
        return;
    }

    const rowBlackList = getRow(grid, rowIndex);
    const colBlacklist = getCol(grid, colIndex);
    const subSquareBlacklist = getSubSquare(grid, rowIndex, colIndex).values.flat();

    return new Set([...rowBlackList, ...colBlacklist, ...subSquareBlacklist].sort());
};

export const reduce2dArray = (arr, reducerFn, initialVal) => {
    let accumulator = initialVal;
    for (let row = 0, totalRows = arr.length; row < totalRows; row++) {
        for (let col = 0, totalCols = arr[row].length; col < totalCols; col++) {
            accumulator = reducerFn(accumulator, arr[row][col], row, col);
        }
    }

    return accumulator;
};

export const isBoxSolved = (grid, rowIndex, colIndex) => {
    return grid[rowIndex][colIndex] !== 0;
};

export const isCompletelySolved = (grid) => {
    const flattened = grid.flat();

    return !flattened.includes(0);
};
