import { reduce2dArray, isBoxSolved, isCompletelySolved } from './utils';
import { directBlacklistMethod, subsquareMethod, rowMethod, columnMethod } from './methods';

const getSolutions = (grid) => {
    const methods = [directBlacklistMethod, subsquareMethod, rowMethod, columnMethod];

    const solutions = reduce2dArray(
        grid,
        (allSolutions, val, row, col) => {
            // Box is done, so skip over it.
            if (isBoxSolved(grid, row, col)) {
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
        },
        []
    );

    return solutions;
};

const applySolutions = (rawGrid, solutions) => {
    const grid = [...rawGrid];

    for (const solution of solutions) {
        const { index, value } = solution;
        const [row, col] = index;

        grid[row][col] = value;
    }

    return grid;
};

export function solve(grid, stats = { tryCount: 0, maxTries: 100 }) {
    if (isCompletelySolved(grid)) {
        return grid;
    }

    const solutions = getSolutions(grid);

    if (solutions.length === 0) {
        console.log("Couldn't find a solution :(");

        // todo: snapshot, then make a guess from a good square.  rollback if.. ?
        return false;
    }

    // apply solutions to grid, then rerun
    const newGrid = applySolutions(grid, solutions);

    return solve(newGrid, { ...stats, tryCount: stats.tryCount + 1 });
}
