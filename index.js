const solvedSet = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const diff = (rawA, rawB) => {
    // convert to sets if needed
    const a = (rawA instanceof Set) ? rawA : new Set([...rawA]);
    const b = (rawB instanceof Set) ? rawB : new Set([...rawB]);

    let aMinusB = new Set([...a].filter(x => !b.has(x)));
    let bMinusA = new Set([...b].filter(x => !a.has(x)));

    return new Set([...aMinusB, ...bMinusA])
}

const intersection = (...sets) => {
    const uniques = new Set(...sets);

    return [...uniques].filter((val) => {
        return sets.every(set => set.has(val))
    });
}

const getRow = (grid, rowIndex) => {
    return [...grid[rowIndex]];
}

const getCol = (grid, colIndex) => {
    return grid.reduce((colOutput, rowArr) => {
        return colOutput.concat(rowArr[colIndex]);
    }, []);
}

const getBoundingBox = (grid, rowIndex, colIndex) => {
    const boxSize = 3;
    const topLeft = [];
    const bottomRight = [];

    topLeft[0] = Math.floor(rowIndex / boxSize) * boxSize;
    topLeft[1] = Math.floor(colIndex / boxSize) * boxSize;

    bottomRight[0] = Math.floor(rowIndex / boxSize) * boxSize + (boxSize - 1);
    bottomRight[1] = Math.floor(colIndex / boxSize) * boxSize + (boxSize - 1);

    return [topLeft, bottomRight];
}

const getSubSquare = (grid, rowIndex, colIndex) => {
    const boundingBox = getBoundingBox(grid, rowIndex, colIndex)
    const [topLeft, bottomRight] = boundingBox;
    const [topLeftRowIndex, topLeftColIndex] = topLeft;
    const [bottomRightRowIndex, bottomRightColIndex] = bottomRight;

    // todo hard-coded to grid size of 3
    return {
        values: [
            grid[topLeftRowIndex].slice(topLeftColIndex, bottomRightColIndex + 1),
            grid[topLeftRowIndex + 1].slice(topLeftColIndex, bottomRightColIndex + 1),
            grid[topLeftRowIndex + 2].slice(topLeftColIndex, bottomRightColIndex + 1),
        ],
        boundingBox
    };
}

const isSolved = (grid, rowIndex, colIndex) => {
    return grid[rowIndex][colIndex] !== 0;
}

const getBlacklist = (grid, rowIndex, colIndex) => {
    if (isSolved(grid, rowIndex, colIndex)) {
        console.warn(`Position is already solved.`);
        return;
    }

    const rowBlackList = getRow(grid, rowIndex);
    const colBlacklist = getCol(grid, colIndex);
    const subSquareBlacklist = getSubSquare(grid, rowIndex, colIndex).values.flat();

    return new Set([...rowBlackList, ...colBlacklist, ...subSquareBlacklist].sort());
}

const reduce2dArray = (arr, reducerFn, initialVal) => {
    let accumulator = initialVal;
    for (let row = 0, totalRows = arr.length; row < totalRows; row++) {
        for (let col = 0, totalCols = arr[row].length; col < totalCols; col++) {
            accumulator = reducerFn(accumulator, arr[row][col], row, col);
        }
    }

    return accumulator;
}

const subsquareMethod = (grid, rowIndex, colIndex) => {
    const { values: subSquareValues, boundingBox } = getSubSquare(grid, rowIndex, colIndex);
    const [topLeft, bottomRight] = boundingBox;
    const [topLeftRowIndex, topLeftColIndex] = topLeft;

    // find shared blacklists for other holes in this subsquare
    const otherHolesBlacklists = reduce2dArray(subSquareValues, (blacklists, val, rawRow, rawCol) => {
        const row = topLeftRowIndex + rawRow;
        const col = topLeftColIndex + rawCol;

        if (isSolved(grid, row, col)) {
            return blacklists;
        }

        // currently focused square - skip, we just want other blacklists.
        if (row === rowIndex && col === colIndex) {
            return blacklists;
        }

        blacklists.push(getBlacklist(grid, row, col));

        return blacklists;
    }, []);

    const blacklistsIntersection = intersection(...otherHolesBlacklists);

    // if we need this val and all other holes have it as a blacklist, 
    // by process of elimination we know it must belong here.
    const subSquareValuesSet = reduce2dArray(subSquareValues, (all, val) => {
        return all.add(val);
    }, new Set());

    const remaining = [...diff(subSquareValuesSet, blacklistsIntersection)].filter(val => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
}

const rowMethod = (grid, rowIndex, colIndex) => {
    const row = getRow(grid, rowIndex);

    const rowBlacklists = row.reduce((blacklists, curVal, curColIndex) => {
        if (isSolved(grid, rowIndex, curColIndex)) {
            return blacklists;
        }

        if (curColIndex === colIndex) {
            return blacklists;
        }

        const blacklist = getBlacklist(grid, rowIndex, curColIndex)

        if (blacklist) {
            blacklists.push(blacklist);
        }

        return blacklists;
    }, []);

    const blacklistsIntersection = intersection(...rowBlacklists);

    const remaining = [...diff(row, blacklistsIntersection)].filter(val => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
}

const columnMethod = (grid, rowIndex, colIndex) => {
    const col = getCol(grid, colIndex);

    const colBlacklists = col.reduce((blacklists, curVal, curRowIndex) => {
        if (isSolved(grid, curRowIndex, colIndex)) {
            return blacklists;
        }

        if (curRowIndex === rowIndex) {
            return blacklists;
        }

        const blacklist = getBlacklist(grid, curRowIndex, colIndex)

        if (blacklist) {
            blacklists.push(blacklist);
        }

        return blacklists;
    }, []);

    const blacklistsIntersection = intersection(...colBlacklists);

    const remaining = [...diff(col, blacklistsIntersection)].filter(val => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
}

const directBlacklistMethod = (grid, rowIndex, colIndex) => {
    const blacklist = getBlacklist(grid, rowIndex, colIndex);
    if (blacklist.size === 9) {
        const answerSet = diff(solvedSet, blacklist).values();
        return answerSet.next().value;
    }

    return false;
}

const getSolutions = (grid) => {
    const methods = [directBlacklistMethod, subsquareMethod, rowMethod, columnMethod];

    const solutions = reduce2dArray(grid, (allSolutions, val, row, col) => {
        // Box is done, so skip over it.
        if (isSolved(grid, row, col)) {
            return allSolutions;
        }

        for (const method of methods) {
            const methodResult = method(grid, row, col);
            if (methodResult) {
                allSolutions.push({
                    index: [row, col],
                    value: methodResult,
                    strategies: [method]
                });

                // found, so return early
                return allSolutions;
            }
        }

        return allSolutions;
    }, []);

    return solutions;
}

const isCompletelySolved = (grid) => {
    const flattened = grid.flat();

    return !flattened.includes(0);
}

const applySolutions = (rawGrid, solutions) => {
    const grid = [...rawGrid];

    for (const solution of solutions) {
        const { index, value } = solution;
        const [row, col] = index;

        grid[row][col] = value;
    }

    return grid;
}

export function solve(grid, stats = { tryCount: 0, maxTries: 100 }) {
    if (isCompletelySolved(grid)) {
        return grid;
    }

    const solutions = getSolutions(grid);

    if (solutions.length === 0) {
        console.log(`Couldn't find a solution :(`);

        // todo: snapshot, then make a guess from a good square.  rollback if.. ?
        return false;
    }

    // apply solutions to grid, then rerun
    const newGrid = applySolutions(grid, solutions);

    return solve(newGrid, { ...stats, tryCount: stats.tryCount + 1 });
}