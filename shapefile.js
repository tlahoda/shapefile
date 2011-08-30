/**
 * \file shapefile.js
 * Contains the shapefile library.
 *
 * Copyright (C) 2011 Thomas P. Lahoda
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

// Code from https://developer.mozilla.org/En/Using_XMLHttpRequest#Receiving_binary_data
function load_binary_resource (url) {
  var req = new XMLHttpRequest ();
  req.open ('GET', url, false);
  req.overrideMimeType('text/plain; charset=x-user-defined');
  req.send (null);
  //Change 200 to 0 for local file testing
  if (req.status != 200) throw "Unable to load " + url;
    return req.responseText;
}

/**
 * Strips the first arguments off and returns the remaining arguments.
 *
 * \return The remaining arguments.
 */
function stripArgRange (begin, end, args) {
  var length = end - begin;
  if (length > args.length) throw "Range exceeds boundaries.";
  var res = new Array (length);
  if (length == 0) return; 
  for (var i = 0; i < length; ++i)
    res[i] = args[i + begin];
  return res;
}

function readBigEndianInt32 (reader) {
  return reader.endianSwap (reader.readInt32 ());
}

function readInt32 (reader) {
  return reader.readInt32 ();
}

function readDouble (reader) {
  return reader.readDouble ();
}

function readPoint (shp) {
  var x = shp.readDouble ();
  var y = shp.readDouble ();
  return [x. y];
}

/**
 * Reads a two element array where the elements are reversed in the BinaryReader.
 *
 * \param shp The BinaryReader from which to read.
 *
 * \return The array.
 */
function readReversedPoint (shp) {
  var first = shp.readDouble ();
  var second = shp.readDouble ();
  return [second, first];
}


function readRecordHeader (shx) {
  var offset = shx.endianSwap (shx.readInt32 ()) * 2;
  var contentLen = shx.endianSwap (shx.readInt32 ()) * 2;
  return [offset, contentLen];
}

function readOffset (shx) {
  return readRecordHeader (shx)[0] + 8;
}

function readRange (begin, end, action, shp) {
  for (var i = begin; i < end; ++i)
    this[i] = action.apply (null, stripArgRange (3, arguments.length, arguments));
}

/**
 * \class Header The shapefile header contains various pieces of management data for the shapefile.
 */
var Header = Class.create ({
  FILE_CODE: 0,
  FILE_LENGTH: 6,
  VERSION: 7,
  SHAPE_TYPE: 8,
  XMIN: 9,
  YMIN: 10,
  XMAX: 11,
  YMAX: 12,
  ZMIN: 13,
  ZMAX: 14,
  MMIN: 15,
  MMAX: 16,

  /**
   * Creates a Header.
   *
   * \param shx The binaryReader containg the shapefile index.
   */
  initialize: function (shx) {
    this.header = new Array (17);
    readRange.call (this.header, 0, 7, readBigEndianInt32, shx);
    readRange.call (this.header, 7, 9, readInt32, shx);
    readRange.call (this.header, 9, 17, readDouble, shx);

    this.numShapes = ((this.header[this.FILE_LENGTH] * 2) - 100) / 8;
    this.offsets = new Array (this.numShapes);
    readRange.call (this.offsets, 0, this.numShapes, readOffset, shx);
  }
});

/**
 * \class Shape The base shape class. Also represents a null shape.
 */
var Shape = Class.create ({
  SHAPE_TYPE: 0,

  /**
   * Creates a Shape.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function (shapeType, shp) {
    this.header = new Array (1);
    this.header[this.SHAPE_TYPE] = shapeType;
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    //Does nothing.
  }
});

/**
 * \class Point Represents a point.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var Point = Class.create (Shape, {
  X: 0,
  Y: 1,

  /**
   * Creates a Point.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    this.coords = readPoint (shp);
  },

  /**
   * Applies action to the Point.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    action.apply (this.coords, stripArgRange (1, arguments.length, arguments));
  }
});

/**
 * \class PointZ Represents a PointZ.
 */
var PointZ = Class.create (Point, {
  /**
   * Creates a PointZ.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    this.z = shp.readDouble ();
    this.m = shp.readDouble ();
  }
});

/**
 * \class PointM Represents a measured point.
 */
var PointM = Class.create (Point, {
  /**
   * Creates a PointM.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    this.m = shp.readDouble ();
  }
});

/**
 * \class MultiPoint Represents a set of points.
 */
var MultiPoint = Class.create (Shape, {
  X: 0,
  Y: 1,
  XMIN: 1,
  YMIN: 2,
  XMAX: 3,
  YMAX: 4,
  NUM_POINTS: 5,

  /**
   * Creates a MultiPoint.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    readRange.call (this.header, 1, 5, readDouble, shp);
    var numPoints = shp.readInt32 ();
    this.header[this.NUM_POINTS] = numPoints;
    this.points = new Array (numPoints);
    readRange.call (this.points, 0, numPoints, readPoint, shp);
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    for (var i = 0, numPoints = this.header[this.NUM_POINTS]; i < numPoints; ++i)
      action.apply (this.points[i], stripArgRange (1, arguments.length, arguments));
  }
});

/**
 * \class MultiPointZ Represents a set of MultiPointZs.
 */
var MultiPointZ = Class.create (MultiPoint, {
  /**
   * Creates a MultiPointZ.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);

    var numPoints = this.header[this.NUM_POINTS];
    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zarray = new Array (numPoints);
    readRange.call (this.Zarray, 0, numPoints, readDouble, shp);

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (numPoints);
    readRange.call (this.Marray, 0, numPoints, readDouble, shp);
  }
});

/**
 * \class MultiPointM Represents a set of measured points.
 */
var MultiPointM = Class.create (MultiPoint, {
  /**
   * Creates a MultiPointM.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    
    var numPoints = this.header[this.NUM_POINTS];
    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (numPoints);
    readRange.call (this.Marray, 0, numPoints, readDouble, shp);
  }
});

/**
 * Reads a set of objects.
 *
 * \param numObjects The number of objects to read.
 * \param numPoints The total number of points in all of the objects.
 * \param partsIndex The indices to the objects.
 * \param reader the object reader.
 * \param shp The BinaryReader from which to read.
 *
 * \return An array containing the objects.
 */
function readObjects (numPoints, partsIndex, reader, shp) {
  var numParts = this.length;
  for (var i = 0; i < numParts; ++i) {
    var length = ((i == numParts - 1) ? numPoints : partsIndex[i + 1]) - partsIndex[i];
    this[i] = new Array (length);
    readRange.call (this[i], 0, length, reader, shp);
  }
}

/**
 * \class Polygon Represents a polygon.
 */
var Polygon = Class.create (Shape, {
  X: 0,
  Y: 1,
  XMIN: 1,
  YMIN: 2,
  XMAX: 3,
  YMAX: 4,
  NUM_PARTS: 5,
  NUM_POINTS: 6,

  /**
   * Creates a Polygon.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
   
    readRange.call (this.header, 1, 5, readDouble, shp);
    readRange.call (this.header, 5, 7, readInt32, shp);

    var numParts = this.header[this.NUM_PARTS];
    var numPoints = this.header[this.NUM_POINTS];

    var partsIndex = new Array (numParts);
    readRange.call (partsIndex, 0, numParts, readInt32, shp);

    this.parts = new Array (numParts);
    readObjects.call (this.parts, numPoints, partsIndex, readReversedPoint, shp)
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    for (var i = 0, numParts = this.header[this.NUM_PARTS]; i < numParts; ++i)
      for (var j = 0, length = this.parts[i].length; j < length; ++j)
        action.apply (this.parts[i][j], stripArgRange (1, arguments.length, arguments));
  },

  /**
   * Applies action to each part in the Polygon.
   *
   * \param action The action to apply.
   */
  eachPart: function (action) {
    for (var i = 0, numParts = this.header[this.NUM_PARTS]; i < numParts; ++i)
      action.apply (this.parts[i], stripArgRange (1, arguments.length, arguments));
  }
});

/**
 * \class PolygonZ Represents a PolygonZ.
 */
var PolygonZ = Class.create (Polygon, {
  /**
   * Creates a PolygonZ.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);

    var numParts = this.header[this.NUM_PARTS];
    var numPoints = this.header[this.NUM_POINTS];

    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zparts = new Array (numParts);
    readObjects.call (this.Zparts, numPoints, partsIndex, readDouble, shp);

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array (numParts);
    readObjects.call (this.Mparts, numPoints, partsIndex, readDouble, shp);
  }
});

/**
 * \class PolygonM Represents a PolygonM.
 */
var PolygonM = Class.create (Polygon, {
  /**
   * Creates a PolygonM.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);

    var numParts = this.header[this.NUM_PARTS];
    var numPoints = this.header[this.NUM_POINTS];

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array (numParts);
    this.Mparts = readObjects.call (this.Mparts, numPoints, partsIndex, readDouble, shp);
  }
});

/**
 * \class PolyLine Represents a PolyLine.
 */
var PolyLine = Class.create (Polygon, {
  /**
   * Creates a PolyLine.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * \class PolyLineZ Represents a PolyLineZ.
 */
var PolyLineZ = Class.create (PolygonZ, {
  /**
   * Creates a PolyLineZ.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * \class PolyLineM Represents a PolyLineM.
 */
var PolyLineM = Class.create (PolygonM, {
  /**
   * Creates a PolyLineM.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * \class MultiPatch Represents a MultiPatch. Due to the complicated nature of this shape type it is not yet implemented.
 */
var MultiPatch = Class.create (Shape, {
  /**
   * Creates a MultiPatch.
   *
   * \param shapeType The type of the shape.
   * \param shp The binaryReader containing the main shapefile.
   */
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    //Do nothing
  }
});

/**
 * Creates the appropriate shape type.
 *
 * \param shapeType The type of the shape
 * \param shp The BinaryReader containing the raw shapefile.
 *
 * \throw error On unknown shape type.
 */
function ShapeFactory (shapeType, shp) {
  switch (shapeType) {
    case 0:
      return new Shape (shapeType, shp);
      break;
    case 1:
      return new Point (shapeType, shp);
      break;
    case 3:
      return new PolyLine (shapeType, shp);
      break;
    case 5:
      return new Polygon (shapeType, shp);
      break;
    case 8:
      return new MultiPoint (shapeType, shp);
      break;
    case 11:
      return new PointZ (shapeType, shp);
      break;
    case 13:
      return new PolyLineZ (shapeType, shp);
      break;
    case 15:
      return new PolygonZ (shapeType, shp);
      break;
    case 18:
      return new MultiPointZ (shapeType, shp);
      break;
    case 21:
      return new PointM (shapeType, shp);
      break;
    case 23:
      return new PolyLineM (shapeType, shp);
      break;
    case 25:
      return new PolygonM (shapeType, shp);
      break;
    case 28:
      return new MultiPointM (shapeType, shp);
      break;
    case 31:
      return new MultiPatch (shapeType, shp);
      break;
    default:
      throw "Shape type unknown.";
  }
}

/**
 * \class Shapefile Represents a shapefile
 */
var ShapeFile = Class.create ({
  /**
   * Creates a ShapeFile.
   *
   * \param name The base name of the shape file exluding extensions but including path.
   *
   * \throws error On failure to load the shapefile and on unkown shape type.
   */
  initialize: function (name) {
    this.name = name;
    this.header = new Header (new BinaryReader (load_binary_resource (name + ".shx")));
  
    var shp = new BinaryReader (load_binary_resource (name + ".shp"));
    var numShapes = this.header.numShapes;
    this.shapes = new Array (numShapes);
    for (var i = 0; i < numShapes; ++i) {
      shp.seek (this.header.offsets[i]);
      this.shapes[i] = ShapeFactory (shp.readInt32 (), shp);
    }
  },

  /**
   * Applies action to each vertex in the shapefile.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    for (var i = 0, numShapes = this.header.numShapes; i < numShapes; ++i)
      this.shapes[i].eachVertex.apply (this.shapes[i], arguments);
  },

  /**
   * Applies action to each Shape in the shapefile.
   *
   * \param action The action to apply.
   */
  eachShape: function (action) {
    for (var i = 0, numShapes = this.header.numShapes; i < numShapes; ++i)
      action.apply (this.shapes[i], stripArgRange (1, arguments.length, arguments));
  }
});

