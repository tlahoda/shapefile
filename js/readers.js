/**
 * @file readers.js
 * Contains shapefile readers.
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
 * Reads an int32 from reader.
 *
 * @param value The value.
 * @param dataView The jDataView from which to read.
 *
 * @return The int32.
 */
function readInt32 (value, dataView, littleEndian) {
  return dataView.readInt32 (littleEndian);
}

/**
 * Reads a double from reader.
 *
 * @param value The value.
 * @param dataView The jDataView from which to read.
 *
 * @return The double.
 */
function readDouble (value, dataView) {
  return dataView.readDouble ();
}

/**
 * Reads a point from reader.
 *
 * @param point The point.
 * @param dataView The jDataView from which to read.
 *
 * @return The point.
 */
function readPoint (point, dataView) {
  var x = dataView.readDouble ();
  var y = dataView.readDouble ();
  return [x, y];
}

/**
 * Reads a two element array where the elements are reversed in the BinaryReader.
 *
 * @param point The point.
 * @param dataView The jDataView from which to read.
 *
 * @return The array.
 */
function readReversedPoint (point, dataView) {
  var first = dataView.readDouble ();
  var second = dataView.readDouble ();
  return [second, first];
}

/**
 * Reads a record header from reader.
 *
 * @param dataView The jDataView from which to read.
 *
 * @return The record header.
 */
function readRecordHeader (dataView) {
  var offset = dataView.readInt32 (false) * 2;
  var contentLen = dataView.readInt32 (false) * 2;
  return [offset, contentLen];
}

/**
 * Reads a offset from reader.
 *
 * @param shape The shape.
 * @param dataView The jDataView from which to read.
 *
 * @return The offset.
 */
function readOffset (shape, dataView) {
  return readRecordHeader (dataView)[0] + 8;
}

/**
 * Reads a set of objects.
 *
 * @param object The objects to read.
 * @param numPoints The total number of points in all of the objects.
 * @param partsIndex The indices to the objects.
 * @param reader the object reader.
 * @param dataView The jDataView from which to read.
 *
 * @return An array containing the objects.
 */
function readObjects (objects, numPoints, partsIndex, reader, dataView) {
  var i = 0;
  var numObjects = objects.length;
  objects.apply (function (part) {
    var length = ((i == numObjects - 1) ? numPoints : partsIndex[i + 1]) - partsIndex[i++];
    return new Array (length).apply (reader, dataView);
  });
}

/**
 * Reads a shape from a BinaryReader.
 *
 * @param offset The offset to the shape in the BinaryReader.
 * @param dataView The jDataView from which to read.
 *
 * @return The shape.
 */
function readShape (offset, dataView) {
  return ShapeFactory (offset, dataView);
}

