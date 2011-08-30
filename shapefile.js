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
    for (var i = 0; i < 7; ++i)
      this.header[i] = shx.endianSwap (shx.readInt32 ());
    for (var i = 7; i < 9; ++i)
      this.header[i] = shx.readInt32 ();
    for (var i = 9; i < 17; ++i)
      this.header[i] = shx.readDouble ();

    this.offsets = new Array ();
    this.numShapes = 0;
    while (this.numShapes * 8 + 100 < this.header[this.FILE_LENGTH] * 2) {
      var offset = shx.endianSwap (shx.readInt32 ()) * 2;
      var contentLen = shx.endianSwap (shx.readInt32 ()) * 2;
      this.offsets[this.numShapes++] = offset + 8;
    }
  }
});

/**
 * Strips the first arguments off and returns the remaining arguments.
 *
 * \return The remaining arguments.
 */
function stripFirstArg () {
  if (arguments.length == 0) throw "An action argument is required."
  var args = new Array (arguments.length - 1);
  if (arguments.length > 1)
    for (var i = 1; i < arguments.length; ++i)
      args[i - 1] = arguments[i];
  return args;
}

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
    var x = shp.readDouble ();
    var y = shp.readDouble ();
    this.coords = [x, y];
  },

  /**
   * Applies action to the Point.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    action.apply (this.coords, stripFirstArg.apply (null, arguments));
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
    
    for (var i = 1; i < 5; ++i)
      this.header[i] = shp.readDouble ();
    this.header[this.NUM_POINTS] = shp.readInt32 ();

    this.points = new Array (this.header[this.NUM_POINTS]);
    for (var i = 0; i < this.header[this.NUM_POINTS]; ++i) {
      var x = shp.readDouble ();
      var y = shp.readDouble ();
      this.points[i] = [x, y];
    }
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    for (var i = 0; i < this.header[this.NUM_POINTS]; ++i)
      action.apply (this.points[i], stripFirstArg.apply (null, arguments));
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
    
    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zarray = new Array (this.header[this.NUM_POINTS]);
    for (var i = 0; i < this.header[this.NUM_POINTS]; ++i)
      this.Zarray[i] = shp.readDouble ();

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (this.header[this.NUM_POINTS]);
    for (var i = 0; i < this.header[this.NUM_POINTS]; ++i)
      this.Marray[i] = shp.readDouble ();
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
    
    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (this.header[this.NUM_POINTS]);
    for (var i = 0; i < this.header[this.NUM_POINTS]; ++i)
      this.Marray[i] = shp.readDouble ();
  }
});

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
    
    for (var i = 1; i < 5; ++i)
      this.header[i] = shp.readDouble ();
    for (var i = 5; i < 7; ++i)
      this.header[i] = shp.readInt32 ();

    var partsIndex = new Array (this.header[this.NUM_PARTS]);
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i)
      partsIndex[i] = shp.readInt32 ();

    this.parts = new Array (this.header[this.NUM_PARTS]);
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i) {
      var length = ((i == this.header[this.NUM_PARTS] - 1) ? this.header[this.NUM_POINTS] : partsIndex[i + 1]) - partsIndex[i];
      this.parts[i] = new Array (length);

      for (var j = 0; j < length; ++j) {
        var lon = shp.readDouble ();
        var lat = shp.readDouble ();
        this.parts[i][j] = [lat, lon];
      }
    }
  },

  /**
   * Applies action to each vertex in the shape.
   *
   * \param action The action to apply.
   */
  eachVertex: function (action) {
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i)
      for (var j = 0; j < this.parts[i].length; ++j)
        action.apply (this.parts[i][j], stripFirstArg.apply (null, arguments));
  },

  /**
   * Applies action to each part in the Polygon.
   *
   * \param action The action to apply.
   */
  eachPart: function (action) {
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i)
      action.apply (this.parts[i], stripFirstArg.apply (null, arguments));
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

    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zparts = new Array ();
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i) {
      var length = ((i == this.header[this.NUM_POINTS] - 1) ? this.header[this.NUM_POINTS] : partsIndex[i + 1]) - partsIndex[i];
      this.Zparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Zparts[i][j] = shp.readDouble ();
    }

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array ();
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i) {
      var length = ((i == this.header[this.NUM_PARTS] - 1) ? this.header[this.NUM_POINTS] : partsIndex[i + 1]) - partsIndex[i];
      this.Mparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Mparts[i][j] = shp.readDouble ();
    }
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

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array ();
    for (var i = 0; i < this.header[this.NUM_PARTS]; ++i) {
      var length = ((i == this.header[this.NUM_PARTS] - 1) ? this.header[this.NUM_POINTS] : partsIndex[i + 1]) - partsIndex[i];
      this.Mparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Mparts[i][j] = shp.readDouble ();
    }
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
    this.header = new Header (new BinaryReader (load_binary_resource (name + '.shx')));
  
    var shp = new BinaryReader (load_binary_resource (name + '.shp'));
    this.shapes = new Array(this.header.numShapes);
    for (var i = 0; i < this.header.numShapes; ++i) {
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
    for (var i = 0; i < this.header.numShapes; ++i)
      this.shapes[i].eachVertex.apply (this.shapes[i], arguments);
  },

  /**
   * Applies action to each Shape in the shapefile.
   *
   * \param action The action to apply.
   */
  eachShape: function (action) {
    for (var i = 0; i < this.header.numShapes; ++i)
      action.apply (this.shapes[i], stripFirstArg.apply (null, arguments));
  }
});

