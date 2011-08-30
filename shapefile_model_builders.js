/**
 * \file shapefile_model_builders.js
 * Contains the shapefile three dimensional model builders.
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
 * Makes the webglu data structure for an object.
 *
 * \param vertices The vertices.
 * \param colors The colors of the vertices.
 *
 * \return The data array.
 */
function makeData (vertices, colors) {
  return [["vertex", vertices], 
          ["color", colors],
          ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];
}

/**
 * Fills an array with a value.
 *
 * \param value The value with which to fill.
 *
 * \return The array.
 */
Array.prototype.fill = function (value) {
  for (var i = 0, length = this.length; i < length; ++i)
    this[i] = value;
  return this;
}

/**
 * Makes an array of colors for ian array of vertices.
 *
 * \param arr The array of vertices for whic hto generate colors.
 * \param color The color to make the vertices.
 *
 * \return The array of colors.
 */
function makeVertexColors (arr, color) {
  return new Array (arr.length).fill (color);
}

/**
 * Build the model for a point.
 *
 * \param color The color to render the shape.
 */
function buildPointModel (color) {
  this.model = $W.createObject({ type: $W.GL.POINTS, data: makeData ([this.coords], [color]) });
  this.model.setPosition (0, 0, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
}

/**
 * Builds the model for a MultiPoint.
 *
 * \param color The color to render the shape.
 */
function buildMultiPointModel (color) {
  this.model = $W.createObject({ type: $W.GL.POINTS, data: makeData (this.points, makeVertexColors (this.points, color)) });
  this.model.setPosition (0, 0, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
}

/**
 * Builds the models for a Polygon part.
 *
 * \param color The color of the part.
 */
function buildPolygonPartModel (color) {
  this.model = $W.createObject({ type: $W.GL.POINTS, data: makeData (this, makeVertexColors (this, color)) });
  this.model.setPosition (0, 1, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0);}
}

/**
 * Builds the models for a Polygon.
 *
 * \param color The color to render the shape.
 */
function buildPolygonModels (color) {
  this.eachPart (buildPolygonPartModel, color);
}

/**
 * Builds the models for a MultiPatch.
 *
 * \param color The color to render the shape.
 */
function buildMultiPatchModels (color) {
  //not yet implemented.
}

/**
 * Builds the models for a shape.
 *
 * \param color The color to render the shape.
 */
function buildModels (color) {
  switch (this.header[0]) {
    case 0:
      //NullShape does not need a model.
      break;
    case 1:
    case 11: //PointZ
    case 21: //PointM
      buildPointModel.apply (this, arguments);
      break;
    case 8: //MultiPoint
    case 18: //MultiPointZ
    case 28: //MultiPointM
      buildMultiPointModel.apply (this, arguments);
      break;
    case 3: //PolyLine
    case 5: //Polygon
    case 13: //PolyLineZ
    case 15: //PolygonZ
    case 23: //PolyLineM
    case 25: //PolygonM
      buildPolygonModels.apply (this, arguments);
      break;
    case 31: //MultiPatch
      buildMultiPatchModels.apply (this, arguments);
      break;
    default:
      throw "Shape type unknown.";
  }
}

