import _ from 'lodash';
import md5 from 'blueimp-md5';
import { minVertex } from './vertex_helpers';

class PuzzleState {
  constructor(blocks = []) {
    this.blocks = blocks;
    this.computeAndSaveSignature();
  }

  clone() {
    return new PuzzleState(_.map(this.blocks, (block) => block.clone()));
  }

  addBlock(block) {
    this.blocks.push(block.clone());
    this.computeAndSaveSignature();
  }

  removeBlock(blockIndex) {
    this.blocks.splice(blockIndex, 1);
    this.computeAndSaveSignature();
  }

  hasNoOverlap() {
    const allVertices = _.flatten(_.map(this.blocks, 'vertices'));

    const vertexNames = _.map(allVertices, (vertex) => (
      _.join(vertex, '-')
    ));

    // If there are more total vertices than unique vertices, at least one vertex
    // is repeated, which means there's overlap.
    return vertexNames.length === _.uniq(vertexNames).length;
  }

  normalizeBlocks() {
    const smallestVertex = minVertex(_.map(this.blocks, (block) => block.minVertex()));
    const offsetToSmallestVertex = _.map(smallestVertex, (vertexPoint) => -vertexPoint);

    return _.map(this.blocks, (block) => {
      const newBlock = block.clone();
      newBlock.translate(offsetToSmallestVertex);
      return newBlock;
    });
  }

  computeAndSaveSignature() {
    const normalizedBlocks = this.normalizeBlocks();
    const signature = md5(_.join(_.flattenDeep(_.map(normalizedBlocks, 'vertices'))));
    this.signature = signature;
  }
}

export default PuzzleState;
