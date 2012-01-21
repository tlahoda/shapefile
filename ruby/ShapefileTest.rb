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
require 'Polygon'
require 'Shapefile'
require 'ShapeFactory'

class ShapefileTest < Test::Unit::TestCase
  def setup
    @shapeFile = Shape::Shapefile.new("../../shapefiles/northamerica_adm0")
  end

  def test_header
    assert_equal(9994, @shapeFile.header.fileCode)
    assert_equal(162, @shapeFile.header.fileLength)
    assert_equal(1000, @shapeFile.header.version)
    assert_equal(5, @shapeFile.header.shapeType)
    assert_in_delta(-178.214202880859, @shapeFile.header.xMin, 0.000000000001)
    assert_in_delta(7.20583200454712, @shapeFile.header.yMin, 0.000000000001)
    assert_in_delta(-12.1552801132202, @shapeFile.header.xMax, 0.000000000001)
    assert_in_delta(83.6230316162109, @shapeFile.header.yMax, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.zMin, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.zMax, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.mMin, 0.000000000001)
    assert_in_delta(0.0, @shapeFile.header.mMax, 0.000000000001)
  end

  def test_numshapes
    assert_equal(28, @shapeFile.numShapes)
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

    assert_equal(5, poly.shapeType)
    assert_in_delta(-61.8911018371582, poly.xMin, 0.0000000000001)
    assert_in_delta(16.9897003173828, poly.yMin, 0.0000000000001)
    assert_in_delta(-61.6664009094238, poly.xMax, 0.0000000000001)
    assert_in_delta(17.7250003814697, poly.yMax, 0.0000000000001)
    assert_equal(2, poly.numParts)
    assert_equal(320, poly.numPoints)
  end

  def test_last_shape
    poly = @shapeFile.shapes[@shapeFile.numShapes - 1]

    assert_equal(5, poly.shapeType)
    assert_in_delta(-178.214202880859, poly.xMin, 0.000000000001)
    assert_in_delta(18.9247207641602, poly.yMin, 0.000000000001)
    assert_in_delta(-66.9689025878906, poly.xMax, 0.000000000001)
    assert_in_delta(71.4066467285156, poly.yMax, 0.000000000001)
    assert_equal(44, poly.numParts)
    assert_equal(5140, poly.numPoints)
  end
end

