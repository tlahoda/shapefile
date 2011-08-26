/**
 * file shapefile_render.js
 * Contains the shapefile render function.
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

function Point2d (x, y) {
  this.x = x;
  this.y = y;
}

function ll22d (ll) {
  ll.lat *= deg2rad;
  ll.lon *= deg2rad;
  var slat = Math.sin (piOverTwo - ll.lat);
  return new Point2d (400 + slat * Math.cos (ll.lon) * 400, 800 - (400 + slat * Math.sin (ll.lon) * 400));
}

function transform2d (shapeFile) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[6]; ++j) {
        shape.points[j] = ll22d (shape.points[j]);
    }
  }
}

function render2d (shapeFile, context, color) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[5]; ++j) {
      var startIndex = shape.header[7 + j];
      var endIndex = (j == shape.header[5] - 1) ? shape.header[6] : shape.header[7 + j + 1];

      //var startPoint = ll2Orthoxy (shape.points[startIndex]);
      var startPoint = shape.points[startIndex];
      context.moveTo (startPoint.x, startPoint.y);

      for (var k = startIndex + 1; k < endIndex; ++k) {
        //var temp = ll2Orthoxy (shape.points[k]);
        var temp = shape.points[k];
        context.lineTo (temp.x, temp.y);
      }
    }
  }
  context.strokeStyle = color;
  context.stroke ();
}

function Point3d (x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

function ll23d (ll) {
  ll.lat *= deg2rad;
  ll.lon *= deg2rad;
  var clat = Math.cos (ll.lat);
  return new Point3d (clat * Math.cos (ll.lon), clat * Math.sin (ll.lon), Math.sin (ll.lat));
}

function transform3d () {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[6]; ++j) {
        shape.points[j] = ll23d (shape.points[j]);
    }
  }
}

function render3d (shapeFile, context, color) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[5]; ++j) {
      var startIndex = shape.header[7 + j];
      var endIndex = (j == shape.header[5] - 1) ? shape.header[6] : shape.header[7 + j + 1];

      var startPoint = ll2xyz (shape.points[startIndex]);
      //context.moveTo (startPoint.x, startPoint.y);

      for (var k = startIndex + 1; k < endIndex; ++k) {
        var temp = ll2xyz (shape.points[k]);
        //context.lineTo (temp.x, temp.y);
      }
    }
  }
  context.strokeStyle = color;
  context.stroke ();
}

