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
 * Reads a big endian int32 from reader.
 *
 * \param value The value.
 * \param reader The BinaryReary from which to read.
 *
 * \return The big endian int32.
 */
function readBigEndianInt32 (value, reader) {
  return reader.endianSwap (reader.readInt32 ());
}

/**
 * Reads an int32 from reader.
 *
 * \param value The value.
 * \param reader The BinaryReary from which to read.
 *
 * \return The int32.
 */
function readInt32 (value, reader) {
  return reader.readInt32 ();
}

/**
 * Reads a double from reader.
 *
 * \param value The value.
 * \param reader The BinaryReary from which to read.
 *
 * \return The double.
 */
function readDouble (value, reader) {
  return reader.readDouble ();
}

/**
 * Reads a point from reader.
 *
 * \param point The point.
 * \param reader The BinaryReary from which to read.
 *
 * \return The point.
 */
function readPoint (point, reader) {
  var x = reader.readDouble ();
  var y = reader.readDouble ();
  return [x, y];
}

/**
 * Reads a two element array where the elements are reversed in the BinaryReader.
 *
 * \param point The point.
 * \param reader The BinaryReader from which to read.
 *
 * \return The array.
 */
function readReversedPoint (point, reader) {
  var first = reader.readDouble ();
  var second = reader.readDouble ();
  return [second, first];
}

/**
 * Reads a record header from reader.
 *
 * \param shx The BinaryReary from which to read.
 *
 * \return The record header.
 */
function readRecordHeader (shx) {
  var offset = shx.endianSwap (shx.readInt32 ()) * 2;
  var contentLen = shx.endianSwap (shx.readInt32 ()) * 2;
  return [offset, contentLen];
}

/**
 * Reads a offset from reader.
 *
 * \param shape The shape.
 * \param reader The BinaryReary from which to read.
 *
 * \return The offset.
 */
function readOffset (shape, shx) {
  return readRecordHeader (shx)[0] + 8;
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
    this.header = new Array (17)
      .apply_range (0, 7, readBigEndianInt32, shx)
      .apply_range (7, 9, readInt32, shx)
      .apply_range (9, 17, readDouble, shx);

    this.numShapes = ((this.header[this.FILE_LENGTH] * 2) - 100) / 8;
    this.offsets = new Array (this.numShapes).apply (readOffset, shx);
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
    var args = sliceArguments (arguments, 1);
    args.unshift (this.coords);
    this.coords = action.apply (null, args);
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
    this.header.apply_range (1, 5, readDouble, shp);
    var numPoints = shp.readInt32 ();
    this.header[this.NUM_POINTS] = numPoints;
    this.points = new Array (numPoints).apply (readPoint, shp);
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    Array.apply.call (this.points, arguments);
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
    this.Zarray = new Array (numPoints).apply (readDouble, shp);

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (numPoints).apply (readDouble, shp);
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
    this.Marray = new Array (numPoints).apply (readDouble, shp);
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
    this[i] = new Array (length).apply (reader, shp);
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
   
    this.header.apply_range (1, 5, readDouble, shp)
               .apply_range (5, 7, readInt32, shp);

    var numParts = this.header[this.NUM_PARTS];
    var numPoints = this.header[this.NUM_POINTS];

    var partsIndex = new Array (numParts).apply (readInt32, shp);

    this.parts = new Array (numParts);
    readObjects.call (this.parts, numPoints, partsIndex, readReversedPoint, shp)
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    var args = sliceArguments (arguments);
    args.unshift (function (part) {
      var args = sliceArguments (arguments, 1);
      part.apply.apply (part, args); 
    });

    this.parts.for_each.apply (this.parts, args);
  },
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
});

