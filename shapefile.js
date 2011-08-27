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

/**
 * The shapefile header contains various pieces of management data for the shapefile.
 *
 * \param shx The binaryReader containg the shapefile index.
 */
function Header (shx) {
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

/**
 * Represents a null shape.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function NullShape (shapeType, shp) {
  this.header = new Array (1);
  this.header[0] = shapeType;
}

/**
 * Represents a point.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function Point (shapeType, shp) {
  this.header = new Array (1);
  this.header[0] = shapeType;
  var x = shp.readDouble ();
  var y = shp.readDouble ();
  this.coords = [x, y];
}

/**
 * Represents a polygon.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function Polygon (shapeType, shp) {
  this.header = new Array (6);
  this.header[0] = shapeType;
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
}

/**
 * Represents a set of points.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function MultiPoint (shapeType, shp) {
  this.header = new Array (6);
  this.header[0] = shapeType;
  for (var i = 1; i < 5; ++i)
    this.header[i] = shp.readDouble ();
  this.header[5] = shp.readInt32 ();

  this.points = new Array (this.header[5]);
  for (var i = 0; i < this.header[5]; ++i) {
    var x = shp.readDouble ();
    var y = shp.readDouble ();
    this.points[i] = [x, y];
  }
}

/**
 * Represents a PointZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function PointZ (shapeType, shp) {
  throw "PointZ not implemented.";
}

/**
 * Represents a PolyLineZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function PolyLineZ (shapeType, shp) {
  throw "PolyLineZ not implemented.";
}

/**
 * Represents a PolygonZ.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function PolygonZ (shapeType, shp) {
  throw "PolygonZ not implemented.";
}

/**
 * Represents a set of MultiPointZs.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function MultiPointZ (shapeType, shp) {
  throw "MultiPointZ not implemented.";
}

/**
 * Represents a measured point.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function PointM (shapeType, shp) {
  this.header = new Array (1);
  this.header[0] = shapeType;
  var x = shp.readDouble ();
  var y = shp.readDouble ();
  this.coords = [x, y];
  this.m = shp.readDouble ();
}

/**
 * Represents a PolygonM.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function PolygonM (shapeType, shp) {
  this.header = new Array (6);
  this.header[0] = shapeType;
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

/**
 * Represents a set of measured points.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function MultiPointM (shapeType, shp) {
  this.header = new Array (6);
  this.header[0] = shapeType;
  for (var i = 1; i < 5; ++i)
    this.header[i] = shp.readDouble ();
  this.header[5] = shp.readInt32 ();

  this.points = new Array (this.header[5]);
  for (var i = 0; i < this.header[5]; ++i) {
    var x = shp.readDouble ();
    var y = shp.readDouble ();
    this.points[i] = [x, y];
  }

  this.Mmin = shp.readDouble ();
  this.Mmax = shp.readDouble ();
  this.Marray = new Array (this.header[5]);
  for (var i = 0; i < this.header[5]; ++i)
    this.Marray[i] = shp.readDouble ();
}

/**
 * Represents a MultiPatch.
 *
 * \param shapeType The type of the shape.
 * \param shp The binaryReader containing the main shapefile.
 */
function MultiPatch (shapeType, shp) {
  throw "MultiPatch not implemented.";
}

/**
 * Creates the appropriate shape type.
 *
 * \param shapeType The type of the shape
 * \param shp The BinaryReader containing the raw shapefile.
 */
function ShapeFactory (shapeType, shp) {
  switch (shapeType) {
    case 0:
      return new NullShape (shapeType, shp);
      break;
    case 1:
      return new Point (shapeType, shp);
      break;
    case 3:
      //Polyline has the same structure as Polygon so using it for now.
      return new Polygon (shapeType, shp);
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
      //PolylineM has the same structure as PolygonM so using it for now.
      return new PolygonM (shapeType, shp);
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
 */
function ShapeFile (name) {
  var shxFile = load_binary_resource (name + '.shx');
    var shx = new BinaryReader (shxFile);
    this.header = new Header (shx);
   
    var shpFile = load_binary_resource (name + '.shp');
    var shp = new BinaryReader (shpFile);

    this.shapes = new Array(this.header.numShapes);
    for (var i = 0; i < this.header.numShapes; ++i) {
      shp.seek (this.header.offsets[i]);
      this.shapes[i] = ShapeFactory (shp.readInt32 (), shp);
    }
}

