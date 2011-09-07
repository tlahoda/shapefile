/**
 * @file coordinate_transforms.js
 * Contains coordinate transform functions.
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
Math.piOverTwo = Math.PI / 2.0;

/**
 * Precalculated deg2rad conversion factor.
 */
Math.deg2rad = Math.PI / 180.0;

/**
 * Converts a lat/lon point to a two dimensional point in an orthographic projection.
 *
 * @param point The lat/lon point.
 *
 * @return The two dimensional point.
 */
function toOrtho (point) {
  point[0] *= Math.deg2rad;
  point[1] *= Math.deg2rad;
  var slat = Math.sin (Math.piOverTwo - point[0]);
  return [slat * Math.cos (point[1]), slat * Math.sin (point[1])];
}

/**
 * Converts a lat/lon point to a three dimensional point.
 *
 * @param point The lat/lon point.
 *
 * @return The WebGL dimensional point.
 */
function toWebGL (point) {
  point[0] *= Math.deg2rad;
  point[1] *= Math.deg2rad;
  var clat = Math.cos (point[0]);
  return [clat * Math.cos (point[1]), Math.sin (point[0]), -(clat * Math.sin (point[1]))];
}

/**
 * Scales a vertex.
 *
 * @param vertex The vertex.
 * @param s The scaling factor.
 * @param axis The axis to scale. If not present all axes are scaled.
 *
 * @return The scaled vertex.
 */
function scale (vertex, s, axis) {
  if (axis == undefined)
    return vertex.apply (function (ele, s) { return ele * s; }, s);
  vertex[axis] *= s;
  return vertex;
}

/**
 * Shifts a vertex.
 *
 * @param vertex The vertex.
 * @param s The amount to shift.
 * @param axis The axis to shift. If not present all axes are shifted.
 *
 * @return The shifted vertex.
 */
function shift (vertex, s, axis) {
  if (axis == undefined)
    return vertex.apply (function (ele, s) { return ele + s; }, s);
  vertex[axis] += s;
  return vertex;
}

/**
 * Inverts a vertex.
 *
 * @param vertex The vertex.
 * @param bound The max bound of the axis.
 * @param axis The axis to invert. If not present all axes are inverted.
 *
 * @return The inverted vertex.
 */
function invert (vertex, bound, axis) {
  if (axis == undefined)
    return vertex.apply (function (ele, bound) { return bound - ele; }, bound);
  vertex[axis] = bound - vertex[axis];
  return vertex;
}

