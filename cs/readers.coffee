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
