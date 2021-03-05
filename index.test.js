import { solve } from './';
import { puzzles } from './samplePuzzles';

describe('sudoku', () => {
    puzzles.forEach(({ name, grid }) => {
        test(name, () => {
            const solution = solve(grid);
            expect(solution).toMatchSnapshot();
        });
    });
});