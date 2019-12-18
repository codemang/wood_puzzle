require 'geo3d'
require 'byebug'

def rotate_around_point(point_to_rotate, object_center, rotation_axis, degrees)
  translation1 = Geo3d::Matrix.translation -object_center.x, -object_center.y, -object_center.z
  new_point_to_rotate = translation1 * point_to_rotate
  rotation_method = "rotation_#{rotation_axis}"
  rotation_matrix = Geo3d::Matrix.send(rotation_method,  degrees)
  rotated_point = rotation_matrix * new_point_to_rotate
  # translation2 = Geo3d::Matrix.translation object_center.x, 0, 0
  translation2 = Geo3d::Matrix.translation object_center.x, object_center.y, object_center.z
  translation2 * rotated_point
end

def test
  point = Geo3d::Vector.point 10, 0, 0
  object_center = Geo3d::Vector.point 13.5, 0.5, 0.5
  new_point = rotate_around_point(point, object_center, 'z', Math::PI)
  puts new_point.x, new_point.y, new_point.z
end

def permutate_wood(wood)

end

correct_1 = [
  [0,0,0],
  'x',
]
correct_2 = [
  [0,0,2],
  'x',
]
correct_3 = [
  [3,-2,-1],
  'y',
]
correct_4 = [
  [3,-2,1],
  'y',
]
correct_5 = [
  [2,1,-3],
  'z',
]
correct_6 = [
  [4,1,-3],
  'z',
]

def generate_correct(correct)
  all_vertices = []
  8.times do |i|
    if correct[1] == 'x'
      all_vertices.push([correct[0][0] + i, correct[0][1], correct[0][2]])
      all_vertices.push([correct[0][0] + i, correct[0][1] + 1, correct[0][2]])
      all_vertices.push([correct[0][0] + i, correct[0][1], correct[0][2] + 1])
      all_vertices.push([correct[0][0] + i, correct[0][1] + 1, correct[0][2] + 1])
    elsif correct[0][1] == 'y'
      all_vertices.push([correct[0][0], correct[0][1] + 1, correct[0][2]])
      all_vertices.push([correct[0][0]+1, correct[0][1] + 1, correct[0][2]])
      all_vertices.push([correct[0][0], correct[0][1] + i, correct[0][2]+1])
      all_vertices.push([correct[0][0]+1, correct[0][1] + i, correct[0][2]+1])
    else
      all_vertices.push([correct[0][0], correct[0][1], correct[0][2] + i])
      all_vertices.push([correct[0][0] + 1, correct[0][1], correct[0][2] + i])
      all_vertices.push([correct[0][0], correct[0][1] + 1, correct[0][2] + i])
      all_vertices.push([correct[0][0] + 1, correct[0][1] + 1, correct[0][2] + i])
    end
  end
  all_vertices
end


puts generate_correct(correct_1)

wood_a = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [3,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [4,1,1],
  [6,1,1],
  [7,1,1],
]

wood_b = [
  [0,0,0],
  [1,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [3,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [4,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]

wood_c = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [3,0,1],
  [5,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [6,1,1],
  [7,1,1],
]

wood_d = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [6,1,1],
  [7,1,1],
]

wood_e = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [3,1,1],
  [4,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]

wood_f = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [3,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [2,0,1],
  [3,0,1],
  [5,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]


#
# end
# puts sum
#
