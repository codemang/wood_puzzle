import _ from 'lodash';

class PuzzleSolution {
  constructor(puzzleStates = []) {
    this.puzzleStates = _.map(puzzleStates, (puzzleState) => puzzleState.clone());
  }

  currentPuzzleState() {
    return _.last(this.puzzleStates);
  }

  addPuzzleState(puzzleState) {
    this.puzzleStates.push(puzzleState.clone());
  }

  isFinished() {
    return this.currentPuzzleState().blocks.length === 0;
  }

  popLastPuzzleState() {
    this.puzzleStates.pop();
  }

  duplicateCurrentPuzzleState() {
    this.addPuzzleState(this.currentPuzzleState());
  }

  append(otherPuzzleSolution) {
    _.forEach(otherPuzzleSolution.puzzleStates, (puzzleState) => {
      this.addPuzzleState(puzzleState);
    });
  }

  appendPuzzleSolution(newPuzzleSolution) {
    _.each(newPuzzleSolution.puzzleStates, (puzzleState) => {
      this.addPuzzleState(puzzleState);
    });
  }

  hasNoDuplicates() {
    const signatures = _.map(this.puzzleStates, 'signature');
    return signatures.length === _.uniq(signatures).length;
  }
}

export default PuzzleSolution;
