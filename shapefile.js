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
 * Represents a Polygon.
 *
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
 * Creates the appropriate shape type.
 *
 * \param shapeType The type of the shape
 * \param shp The BinaryReader containing the raw shapefile.
 */
function ShapeFactory (shapeType, shp) {
  switch (shapeType) {
    case 0:
    case 1:
    case 3:
    case 8:
    case 11:
    case 13:
    case 15:
    case 18:
    case 21:
    case 23:
    case 25:
    case 28:
    case 31:
      throw "Shape type not implemented.";
      break;
    case 5:
      return new Polygon (shapeType, shp);
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

