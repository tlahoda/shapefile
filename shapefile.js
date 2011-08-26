/**
 * file shapefile.js
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

var piOverTwo = Math.PI / 2.0;
var deg2rad = Math.PI / 180.0;

function Point (x, y) {
  this.x = x;
  this.y = y;
}

function endianSwap (num) {
  //The shift then mask on the end prevents a sign issue.
  return ((num & 0xFF) << 24) | ((num & 0xFF00) << 8) | ((num & 0xFF0000) >> 8) | ((num >> 24) & 0xFF);
}

// Code from https://developer.mozilla.org/En/Using_XMLHttpRequest#Receiving_binary_data
function load_binary_resource (url) {
  var req = new XMLHttpRequest ();
  req.open ('GET', url, false);
  req.overrideMimeType('text/plain; charset=x-user-defined');
  req.send (null);
  if (req.status != 200) return '';
    return req.responseText;
}

function Header (shx) {
  this.header = new Array ();
  for (var i = 0; i < 7; ++i)
    this.header[i] = endianSwap (shx.readInt32 ());
  for (var i = 7; i < 9; ++i)
    this.header[i] = shx.readInt32 ();
  for (var i = 9; i < 17; ++i)
    this.header[i] = shx.readDouble ();

  this.offsets = new Array ();
  this.numShapes = 0;
  while (this.numShapes * 8 + 100 < this.header[6] * 2) {
    var offset = endianSwap (shx.readInt32 ()) * 2;
    var contentLen = endianSwap (shx.readInt32 ()) * 2;
    this.offsets[this.numShapes++] = offset + 8;
  }
}

function Shape (shp) {
  this.header = new Array ();
  this.header[0] = shp.readInt32 ();
  for (var i = 1; i < 5; ++i)
    this.header[i] = shp.readDouble ();
  for (var i = 5; i < 7; ++i)
    this.header[i] = shp.readInt32 ();
  for (var i = 7; i < this.header[5] + 7; ++i)
    this.header[i] = shp.readInt32 ();

  this.points = new Array ();
  for (var i = 0; i < this.header[6]; ++i) {
    var lon = shp.readDouble ();
    var lat = shp.readDouble ();
    this.points[i] = new Point (lat, lon);
  }
}

function ShapeFile (name) {
  var shx = new BinaryReader (load_binary_resource (name + '.shx'));
  this.header = new Header (shx);
  
  var shp = new BinaryReader (load_binary_resource (name + '.shp'));
  this.shapes = new Array();
  for (var i = 0; i < this.header.numShapes; ++i) {
    shp.seek (this.header.offsets[i]);
    this.shapes[i] = new Shape (shp);
  }
}

