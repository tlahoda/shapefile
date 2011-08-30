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
 */
function toOrtho () {
  var lat = this[0] * deg2rad;
  var lon = this[1] * deg2rad;
  var slat = Math.sin (piOverTwo - lat);
  this[0] = slat * Math.cos (lon);
  this[1] = slat * Math.sin (lon);
}

/**
 * Converts a lat/lon point to a three dimensional point.
 */
function to3d () {
  var lat = this[0] * deg2rad;
  var lon = this[1] * deg2rad;
  var clat = Math.cos (lat);
  this[0] = clat * Math.cos (lon);
  this[1] = clat * Math.sin (lon);
  this[2] = Math.sin (lat);
}

/**
 * Scales a point.
 *
 * \param s The scaling factor.
 * \param axis The axis to scale. If not present all axes are scaled.
 */
function scale (s, axis) {
  if (axis == undefined) {
    for (var i = 0; i < this.length; ++i)
      this[i] *= s;
  }
  else {
    if (axis >= this.length) throw "axis out of range.";
    this[axis] *= s;
  }
}

/**
 * Shifts a point.
 *
 * \param s The amount to shift.
 * \param axis The axis to shift. If not present all axes are shifted.
 */
function shift (s, axis) {
  if (axis == undefined) {
    for (var i = 0; i < this.length; ++i)
      this[i] += s;
  }
  else {
    if (axis >= this.length) throw "axis out of range.";
    this[axis] += s;
  }
}

/**
 * Inverts a point.
 *
 * \param bound The max bound of the axis.
 * \param axis The axis to invert. If not present all axes are inverted.
 */
function invert (bound, axis) {
  if (axis == undefined) {
    for (var i = 0; i < this.length; ++i)
      this[i] = bound - this[i];
  }
  else {
    if (axis >= this.length) throw "axis out of range.";
    this[axis] = bound - this[axis];
  }
}

/**
 * Converts a point to an integer to rendering will be done without anti-aliasing.
 */
function deAlias () {
  for (var i = 0; i < this.length; ++i)
    this[i] = Math.round (this[i]);
}

