#
# @file Shapefile Contains the Shapefile class.
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
require 'Header'
require 'ShapeFactory'

module Shape
  class Shapefile
    def initialize(fileName)
      shx = File.new(fileName + ".shx", "rb")
      @header = Header.read(shx)

      @numShapes = ((@header.fileLength * 2) - 100) / 8
      @shapes = Array.new(@numShapes);
      shapeFactory = ShapeFactory.new
      
      shp = File.new(fileName + ".shp", "rb")

      @shapes = @shapes.collect do |shape|
        offset = BinData::Int32be.read(shx) * 2 + 8
        contentLength = BinData::Int32be.read(shx) * 2
        
        shape = shapeFactory.create(@header.shapeType)
        shp.seek(offset, IO::SEEK_SET)
        shape.read(shp)
      end

      shx.close
      shp.close

      @shapes.each do |shape|
        puts shape.shapeType
      end
    end
  end
end

