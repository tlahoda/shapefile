/**
 * \file shapefile_transforms.js
 * Contains the shapefile transform functions.
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
function llto2d (ll) {
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
function llto3d (ll) {
  ll[0] *= deg2rad;
  ll[1] *= deg2rad;
  var clat = Math.cos (ll[0]);
  return [clat * Math.cos (ll[1]), clat * Math.sin (ll[1]), Math.sin (ll[0])];
}

/**
 * Transforms a Polygon using the provided transform function.
 *
 * \param shape The shape to transform.
 * \param transformFunction The function with which to transform the shape.
 */
function PolygonTransform (shape, transformFunction) {
  for (var i = 0; i < shape.header[5]; ++i)
    for (var j = 0; j < shape.parts[i].length; ++j)
      shape.parts[i][j] = transformFunction (shape.parts[i][j]);
}

/**
 * Calls the appropriate transformer for the shape type.
 *
 * \param shape The shape to transform.
 * \param transformFunction The function with which to transform the shape.
 */
function TransformFactory (shape, transformFunction) {
  switch (shape.header[0]) {
    case 0:
    case 1:
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
      throw "Shape type transforming not implemented.";
      break;
    case 3:
      //Polyline has the same structure as Polygon so using it for now.
      PolygonTransform (shape, transformFunction);
      break;
    case 5:
      PolygonTransform (shape, transformFunction);
      break;
    default:
      throw "Shape type unknown.";
  }
}

/**
 * Transforms all of the points in a shapefile from lat/lon points to n-dimensional points.
 *
 * \param shapefile The shapefile to transform.
 * \param transformFunction The coordinate transformation function.
 */
function transform (shapeFile, transformFunction) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i)
    TransformFactory (shapeFile.shapes[i], transformFunction);
}

