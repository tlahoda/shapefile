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
  if (req.status != 0) throw "Unable to load " + url;
    return req.responseText;
}

var Color = Class.create ({
  initialize: function (r, g, b, a) {
      this.data = [r & 0xFF, g & 0xFF, b & 0xFF, a & 0xFF];
  },
  to_rgb_string: function () {
      var r = this.data[0];
      var g = this.data[1];
      var b = this.data[2];
      return "#" + ((r < 10) ? "0" : "") + r.toString (16) + ((g < 10) ? "0" : "") + g.toString (16) + 
             ((b < 10) ? "0" : "") + b.toString (16);
  },
  to_rgba_string: function () {
      var r = this.data[0];
      var g = this.data[1];
      var b = this.data[2];
      var a = this.data[3];
      return "#" + ((r < 10) ? "0" : "") + r.toString (16) + ((g < 10) ? "0" : "") + g.toString (16) + 
             ((b < 10) ? "0" : "") + b.toString (16) + ((a < 10) ? "0" : "") + a.toString (16);
  }
});

/**
 * The shapefile header contains various pieces of management data for the shapefile.
 *
 * \param shx The binaryReader containg the shapefile index.
 */
var Header = Class.create ({
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
    while (this.numShapes * 8 + 100 < this.header[6] * 2) {
      var offset = shx.endianSwap (shx.readInt32 ()) * 2;
      var contentLen = shx.endianSwap (shx.readInt32 ()) * 2;
      this.offsets[this.numShapes++] = offset + 8;
    }
  }
});

/**
 * The base shape class. Also represents a null shape.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var Shape = Class.create ({
  initialize: function (shapeType, shp) {
    this.header = new Array (1);
    this.header[0] = shapeType;
  },
  transform: function (transformFunction) {
    //Does nothing.
  }
});

/**
 * Represents a point.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var Point = Class.create (Shape, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    var x = shp.readDouble ();
    var y = shp.readDouble ();
    this.coords = [x, y];
  },
  transform: function (transformFunction) {
    this.coords = transformFunction (shape.coords);
  }
});

/**
 * Represents a PointZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PointZ = Class.create (Point, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    this.z = shp.readDouble ();
    this.m = shp.readDouble ();
  }
});

/**
 * Represents a measured point.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PointM = Class.create (Point, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    this.m = shp.readDouble ();
  }
});

/**
 * Represents a set of points.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var MultiPoint = Class.create (Shape, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    
    for (var i = 1; i < 5; ++i)
      this.header[i] = shp.readDouble ();
    this.header[5] = shp.readInt32 ();

    this.points = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i) {
      var x = shp.readDouble ();
      var y = shp.readDouble ();
      this.points[i] = [x, y];
    }
  },
  transform: function (transformFunction) {
    for (var i = 0; i < this.header[5]; ++i)
      this.points[i] = transformFunction (this.points[i]);
  }
});

/**
 * Represents a set of MultiPointZs.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var MultiPointZ = Class.create (MultiPoint, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    
    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zarray = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i)
      this.Zarray[i] = shp.readDouble ();

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i)
      this.Marray[i] = shp.readDouble ();
  }
});

/**
 * Represents a set of measured points.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var MultiPointM = Class.create (MultiPoint, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    
    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Marray = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i)
      this.Marray[i] = shp.readDouble ();
  }
});

/**
 * Represents a polygon.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var Polygon = Class.create (Shape, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
    
    for (var i = 1; i < 5; ++i)
      this.header[i] = shp.readDouble ();
    for (var i = 5; i < 7; ++i)
      this.header[i] = shp.readInt32 ();

    var partsIndex = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i)
      partsIndex[i] = shp.readInt32 ();

    this.parts = new Array (this.header[5]);
    for (var i = 0; i < this.header[5]; ++i) {
      var length = ((i == this.header[5] - 1) ? this.header[6] : partsIndex[i + 1]) - partsIndex[i];
      this.parts[i] = new Array (length);

      for (var j = 0; j < length; ++j) {
        var lon = shp.readDouble ();
        var lat = shp.readDouble ();
        this.parts[i][j] = [lat, lon];
      }
    }
  },
  transform: function (transformFunction) {
    for (var i = 0; i < this.header[5]; ++i)
      for (var j = 0; j < this.parts[i].length; ++j)
        this.parts[i][j] = transformFunction (this.parts[i][j]);
  }
});

/**
 * Represents a PolygonZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PolygonZ = Class.create (Polygon, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);

    this.Zmin = shp.readDouble ();
    this.Zmax = shp.readDouble ();
    this.Zparts = new Array ();
    for (var i = 0; i < this.header[5]; ++i) {
      var length = ((i == this.header[5] - 1) ? this.header[6] : partsIndex[i + 1]) - partsIndex[i];
      this.Zparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Zparts[i][j] = shp.readDouble ();
    }

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array ();
    for (var i = 0; i < this.header[5]; ++i) {
      var length = ((i == this.header[5] - 1) ? this.header[6] : partsIndex[i + 1]) - partsIndex[i];
      this.Mparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Mparts[i][j] = shp.readDouble ();
    }
  }
});

/**
 * Represents a PolygonM.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PolygonM = Class.create (Polygon, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);

    this.Mmin = shp.readDouble ();
    this.Mmax = shp.readDouble ();
    this.Mparts = new Array ();
    for (var i = 0; i < this.header[5]; ++i) {
      var length = ((i == this.header[5] - 1) ? this.header[6] : partsIndex[i + 1]) - partsIndex[i];
      this.Mparts[i] = new Array (length);

      for (var j = 0; j < length; ++j)
        this.Mparts[i][j] = shp.readDouble ();
    }
  }
});

/**
 * Represents a PolyLine.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PolyLine = Class.create (Polygon, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * Represents a PolyLineZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PolyLineZ = Class.create (PolygonZ, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * Represents a PolyLineM.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var PolyLineM = Class.create (PolygonM, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  }
});

/**
 * Represents a MultiPatch. Due to the complicated nature of this shape type it is not yet implemented.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
var MultiPatch = Class.create (Shape, {
  initialize: function ($super, shapeType, shp) {
    $super (shapeType, shp);
  },
  transform: function (transformFunction) {
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
 * Represents a shapefile
 *
 * \param name The base name of the shape file exluding extensions but including path.
 *
 * \throws error On failure to load the shapefile and on unkown shape type.
 */
var ShapeFile = Class.create ({
  initialize: function (name) {
    this.name = name;
    this.header = new Header (new BinaryReader (load_binary_resource (name + '.shx')));
  
    var shp = new BinaryReader (load_binary_resource (name + '.shp'));
    this.shapes = new Array(this.header.numShapes);
    for (var i = 0; i < this.header.numShapes; ++i) {
      shp.seek (this.header.offsets[i]);
      this.shapes[i] = ShapeFactory (shp.readInt32 (), shp);
    }
  }
});

