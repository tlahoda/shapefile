#
# @file ShapefileTest Contains the ShapefileTest class.
#
# Copyright (C) 2011 Thomas P. Lahoda
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
#
require 'test/unit'
require 'Shapefile'
require 'ShapeFactory'

class ShapefileTest < Test::Unit::TestCase
  def setup
    @shapeFile = Shape::Shapefile.new("../../shapefiles/northamerica_adm0")
  end

  def test_header
    assert_equal(9994, @shapeFile.header.file_code)
    assert_equal(162, @shapeFile.header.file_length)
    assert_equal(1000, @shapeFile.header.version)
    assert_equal(5, @shapeFile.header.shape_type)
    assert_in_delta(-178.214202880859, @shapeFile.header.b_box.x_min, 0.000000000001)
    assert_in_delta(7.20583200454712, @shapeFile.header.b_box.y_min, 0.000000000001)
    assert_in_delta(-12.1552801132202, @shapeFile.header.b_box.x_max, 0.000000000001)
    assert_in_delta(83.6230316162109, @shapeFile.header.b_box.y_max, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.z_bounds.minimum, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.z_bounds.maximum, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.m_bounds.minimum, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.m_bounds.maximum, 0.000000000001)
  end

  def test_numshapes
    assert_equal(28, @shapeFile.num_shapes)
  end

  def test_shapefactory
    shapeFactory = Shape::ShapeFactory.new

    assert_equal(Shape::NullShape, shapeFactory.create(0).class)
    assert_equal(Shape::Point, shapeFactory.create(1).class)
    assert_equal(Shape::PolyLine, shapeFactory.create(3).class)
    assert_equal(Shape::Polygon, shapeFactory.create(5).class)
    assert_equal(Shape::MultiPoint, shapeFactory.create(8).class)
    assert_equal(Shape::PointZ, shapeFactory.create(11).class)
    assert_equal(Shape::PolyLineZ, shapeFactory.create(13).class)
    assert_equal(Shape::PolygonZ, shapeFactory.create(15).class)
    assert_equal(Shape::MultiPointZ, shapeFactory.create(18).class)
    assert_equal(Shape::PointM, shapeFactory.create(21).class)
    assert_equal(Shape::PolyLineM, shapeFactory.create(23).class)
    assert_equal(Shape::PolygonM, shapeFactory.create(25).class)
    assert_equal(Shape::MultiPointM, shapeFactory.create(28).class)
    assert_raise RuntimeError do
      shapeFactory.create(32)
    end
    assert_raise RuntimeError do
      shapeFactory.create(33)
    end
  end

  def test_first_shape
    poly = @shapeFile.shapes[0]

    assert_equal(5, poly.shape_type)
    assert_in_delta(-61.8911018371582, poly.b_box.x_min, 0.0000000000001)
    assert_in_delta(16.9897003173828, poly.b_box.y_min, 0.0000000000001)
    assert_in_delta(-61.6664009094238, poly.b_box.x_max, 0.0000000000001)
    assert_in_delta(17.7250003814697, poly.b_box.y_max, 0.0000000000001)
    assert_equal(2, poly.num_parts)
    assert_equal(320, poly.num_points)
  end

  def test_last_shape
    poly = @shapeFile.shapes[@shapeFile.num_shapes - 1]

    assert_equal(5, poly.shape_type)
    assert_in_delta(-178.214202880859, poly.b_box.x_min, 0.000000000001)
    assert_in_delta(18.9247207641602, poly.b_box.y_min, 0.000000000001)
    assert_in_delta(-66.9689025878906, poly.b_box.x_max, 0.000000000001)
    assert_in_delta(71.4066467285156, poly.b_box.y_max, 0.000000000001)
    assert_equal(44, poly.num_parts)
    assert_equal(5140, poly.num_points)
  end
end

