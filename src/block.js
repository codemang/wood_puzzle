import _ from 'lodash';
import * as THREE from 'three';
import { minVertex } from './vertex_helpers';

class Block {
  constructor(vertices, id) {
    this.vertices = vertices;
    this.id = id;
    this.isUsingTransformationChain = false;
  }

  clone() {
    return new Block(_.cloneDeep(this.vertices), this.id);
  }

  translateX(amount) {
    this.translate([amount, 0, 0]);
  }

  translateY(amount) {
    this.translate([0, amount, 0]);
  }

  translateZ(amount) {
    this.translate([0, 0, amount]);
  }

  rotateX(radians) {
    const rotation = new THREE.Matrix4().makeRotationX(radians);
    this.applyMatrixWithPossibleChaining(rotation);
  }

  rotateY(radians) {
    const rotation = new THREE.Matrix4().makeRotationY(radians);
    this.applyMatrixWithPossibleChaining(rotation);
  }

  rotateZ(radians) {
    const rotation = new THREE.Matrix4().makeRotationZ(radians);
    this.applyMatrixWithPossibleChaining(rotation);
  }

  minVertex() {
    return minVertex(this.vertices);
  }

  translate(translationOffsets) {
    const translationM = new THREE.Matrix4().makeTranslation(...translationOffsets);
    this.applyMatrixWithPossibleChaining(translationM);
  }

  applyMatricesToBlock(matrices) {
    const newVertices = [];

    this.vertices.forEach((vertex) => {
      let newVertex = new THREE.Vector3(...vertex);
      matrices.forEach((matrix) => { newVertex = newVertex.applyMatrix4(matrix); });
      const roundedNewVertex = _.map(newVertex.toArray(), Math.round);
      newVertices.push(roundedNewVertex);
    });

    this.vertices = newVertices;
  }

  startTransformationChain() {
    this.isUsingTransformationChain = true;
    this.transformationChain = [];
  }

  commitTransformationChain() {
    this.applyMatricesToBlock(this.transformationChain);
    this.isUsingTransformationChain = false;
  }

  applyMatrixWithPossibleChaining(matrix) {
    if (this.isUsingTransformationChain) {
      this.transformationChain.push(matrix);
    } else {
      this.applyMatrixToBlock(matrix);
    }
  }

  applyMatrixToBlock(matrix) {
    this.applyMatricesToBlock([matrix]);
  }
}

export default Block;
