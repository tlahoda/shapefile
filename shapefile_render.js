/**
 * \file shapefile_render.js
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

/**
 * Precalculated pi / 2.
 */
var piOverTwo = Math.PI / 2.0;

/**
 * Precalculated deg2rad conversion factor.
 */
var deg2rad = Math.PI / 180.0;

/**
 * Converts a lat/lon point to a two dimensional point in an orthographic projection.
 *
 * \param ll The lat/lon point.
 *
 * \return The two dimensional point.
 */
function ll22d (ll) {
  ll[0] *= deg2rad;
  ll[1] *= deg2rad;
  var slat = Math.sin (piOverTwo - ll[0]);
  return [400 + slat * Math.cos (ll[1]) * 400, 800 - (400 + slat * Math.sin (ll[1]) * 400)];
}

/**
 * Converts a lat/lon point to a three dimensional point.
 *
 * \param ll The lat/lon point.
 *
 * \return The three dimensional point.
 */
function ll23d (ll) {
  ll[0] *= deg2rad;
  ll[1] *= deg2rad;
  var clat = Math.cos (ll[0]);
  return [clat * Math.cos (ll[1]), clat * Math.sin (ll[1]), Math.sin (ll[0])];
}

/**
 * Transforms all of the points in a shapefile from lat/lon points to n-dimensional points.
 *
 * \param shapefile The shapefile to transform.
 * \param transformFunction The coordinate transformation function.
 */
function transform (shapeFile, transformFunction) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[5]; ++j)
      for (var k = 0; k < shape.parts[j].length; ++k)
        shape.parts[j][k] = transformFunction (shape.parts[j][k]);
  }
}

/**
 * Renders a shapefile in a two dimensional orthographic projection.
 *
 * \param shapeFile The shapefile.
 * \param context The canvas onto which to draw.
 * \param color, The color to render the shapes.
 */
function render2d (shapeFile, context, color) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[5]; ++j) {
      var startPoint = shape.parts[j][0];
      context.moveTo (startPoint[0], startPoint[1]);
      
      for (var k = 1; k < shape.parts[j].length; ++k) {
        var temp = shape.parts[j][k];
        context.lineTo (temp[0], temp[1]);
      }
    }
  }
  context.strokeStyle = color;
  context.stroke ();
}

/**
 * Renders a shapefile in 3d.
 *
 * \param shapeFile The shapefile.
 * \param context The canvas onto which to draw.
 * \param color, The color to render the shapes.
 */
function render3d (shapeFile, context, color) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    //the innards of this loop are going to change, just pass array of vertices into webgl.
    for (var j = 0; j < shape.header[5]; ++j) {
      var startPoint = shape.parts[j][0];
      //context.moveTo (startPoint[0], startPoint[1]);
      
      for (var k = 1; k < shape.parts[j].length; ++k) {
        var temp = shape.parts[j][k];
        //context.lineTo (temp[0], temp[1]);
      }
    }
  }
  context.strokeStyle = color;
  context.stroke ();
}

