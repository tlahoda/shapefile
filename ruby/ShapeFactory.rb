#
# @file ShapeFactory.rb Contains the ShapeFactory class.
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
require 'NullShape'
require 'Point'
require 'PolyLine'
require 'Polygon'
require 'MultiPoint'
require 'PointZ'
require 'PolyLineZ'
require 'PolygonZ'
require 'MultiPointZ'
require 'PointM'
require 'PolyLineM'
require 'PolygonM'
require 'MultiPointM'

module Shape
  class ShapeFactory
    def create(shapeType)
      case shapeType
        when 0
          NullShape.new
        when 1
          Point.new
        when 3
          PolyLine.new
        when 5
          Polygon.new
        when 8
          MultiPoint.new
        when 11
          PointZ.new
        when 13
          PolyLineZ.new
        when 15
          PolygonZ.new
        when 18
          MultiPointZ.new
        when 21
          PointM.new
        when 23
          PolyLineM.new
        when 25
          PolygonM.new
        when 28
          MultiPointM.new
        when 32
          raise "MultiPatch is not yet implemented."
        else
          raise "Unknown shape type."
      end
    end
  end
end

