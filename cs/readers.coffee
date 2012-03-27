#
# @file readers.coffee Contains shapefile readers.
#
# Copyright (C) 2012 Thomas P. Lahoda
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
readInt32 = (value, dataView, littleEndian) ->
  dataView.readInt32 littleEndian

readDouble = (value, dataView) ->
  dataView.readDouble()

readPoint = (point, dataView) ->
  x = dataView.readDouble()
  y = dataView.readDouble()
  [x, y]

readReversedPoint = (point, dataView) ->
  first = dataView.readDouble()
  second = dataView.readDouble()
  [second, first]

readRecordHeader = (dataView) ->
  offset = 2 * dataView.readInt32 false
  contentLen = 2 * dataView.readInt32 false
  [offset, contentLen]

readOffset = (shape, dataView) ->
  t = readRecordHeader dataView
  return t[0] + 8

readObjects = (objects, numPoints, partsIndex, reader, dataView) ->
  i = 0
  numObjects = objects.length
  objects.apply (part) ->

    length = 0;
    if i == numObjects - 1
      length = numPoints
    else
      length = partsIndex[i + 1]
    length -= partsIndex[i++]

    t = new Array length
    return t.apply reader, dataView
  return

readShape = (offset, dataView) ->
  ShapeFactory offset, dataView
