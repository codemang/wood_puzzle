import _ from 'lodash';

export const minVertex = (vertices) => (
  _.minBy(vertices, _.sum)
);
