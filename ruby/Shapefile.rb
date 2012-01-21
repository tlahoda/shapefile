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
    $WORD_LENGTH = 2
    $HEADER_LENGTH = 100
    $SHX_RECORD_LENGTH = 8
    $SHAPE_START_OFFSET = 8
    $SHX_EXTENSION = ".shx"
    $SHP_EXTENSION = ".shp"
    $BINARY_READ = "rb"

    attr_accessor :header
    attr_accessor :numShapes

    def initialize(fileName)
      shx = File.new(fileName + $SHX_EXTENSION, $BINARY_READ)
      @header = Header.read(shx)

      @numShapes = ((@header.fileLength * $WORD_LENGTH) - $HEADER_LENGTH) / $SHX_RECORD_LENGTH
      
      shp = File.new(fileName + $SHP_EXTENSION, $BINARY_READ)
      shapeFactory = ShapeFactory.new

      @shapes = Array.new(@numShapes);
      @shapes = @shapes.collect do |shape|
        offset = BinData::Int32be.read(shx) * $WORD_LENGTH + $SHAPE_START_OFFSET
        contentLength = BinData::Int32be.read(shx) * $WORD_LENGTH
        
        shape = shapeFactory.create(@header.shapeType)
        shp.seek(offset, IO::SEEK_SET)
        shape.read(shp)
      end

      shp.close
      shx.close
    end
  end
end

