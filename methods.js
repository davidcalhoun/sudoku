import {
    getSubSquare,
    isBoxSolved,
    reduce2dArray,
    getBlacklist,
    intersection,
    diff,
    getRow,
    getCol,
    solvedSet
} from './utils';

export const subsquareMethod = (grid, rowIndex, colIndex) => {
    const { values: subSquareValues, boundingBox } = getSubSquare(grid, rowIndex, colIndex);
    const [topLeft /*, bottomRight*/] = boundingBox;
    const [topLeftRowIndex, topLeftColIndex] = topLeft;

    // find shared blacklists for other holes in this subsquare
    const otherHolesBlacklists = reduce2dArray(
        subSquareValues,
        (blacklists, val, rawRow, rawCol) => {
            const row = topLeftRowIndex + rawRow;
            const col = topLeftColIndex + rawCol;

            if (isBoxSolved(grid, row, col)) {
                return blacklists;
            }

            // currently focused square - skip, we just want other blacklists.
            if (row === rowIndex && col === colIndex) {
                return blacklists;
            }

            blacklists.push(getBlacklist(grid, row, col));

            return blacklists;
        },
        []
    );

    const blacklistsIntersection = intersection(...otherHolesBlacklists);

    // if we need this val and all other holes have it as a blacklist,
    // by process of elimination we know it must belong here.
    const subSquareValuesSet = reduce2dArray(
        subSquareValues,
        (all, val) => {
            return all.add(val);
        },
        new Set()
    );

    const remaining = [...diff(subSquareValuesSet, blacklistsIntersection)].filter((val) => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
};

export const rowMethod = (grid, rowIndex, colIndex) => {
    const row = getRow(grid, rowIndex);

    const rowBlacklists = row.reduce((blacklists, curVal, curColIndex) => {
        if (isBoxSolved(grid, rowIndex, curColIndex)) {
            return blacklists;
        }

        if (curColIndex === colIndex) {
            return blacklists;
        }

        const blacklist = getBlacklist(grid, rowIndex, curColIndex);

        if (blacklist) {
            blacklists.push(blacklist);
        }

        return blacklists;
    }, []);

    const blacklistsIntersection = intersection(...rowBlacklists);

    const remaining = [...diff(row, blacklistsIntersection)].filter((val) => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
};

export const columnMethod = (grid, rowIndex, colIndex) => {
    const col = getCol(grid, colIndex);

    const colBlacklists = col.reduce((blacklists, curVal, curRowIndex) => {
        if (isBoxSolved(grid, curRowIndex, colIndex)) {
            return blacklists;
        }

        if (curRowIndex === rowIndex) {
            return blacklists;
        }

        const blacklist = getBlacklist(grid, curRowIndex, colIndex);

        if (blacklist) {
            blacklists.push(blacklist);
        }

        return blacklists;
    }, []);

    const blacklistsIntersection = intersection(...colBlacklists);

    const remaining = [...diff(col, blacklistsIntersection)].filter((val) => val !== 0);

    return remaining.length === 1 ? remaining[0] : false;
};

export const directBlacklistMethod = (grid, rowIndex, colIndex) => {
    const blacklist = getBlacklist(grid, rowIndex, colIndex);
    if (blacklist.size === 9) {
        const answerSet = diff(solvedSet, blacklist).values();
        return answerSet.next().value;
    }

    return false;
};
