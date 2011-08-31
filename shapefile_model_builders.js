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
 * Returns a value with which to set an array element.
 *
 * \param value The value with which to fill.
 *
 * \return The value.
 */
function set (value) {
  return value;
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
  return new Array (arr.length).apply (set, color);
}

/**
 * Builds a model. Uses GL.POINTS for now.
 *
 * \param modelType The type of the model.
 * \param vertices The model vertices.
 * \param colors The model colors.
 *
 * \return The model.
 */
function buildModel (modelType, vertices, colors, rotate) {
  var model = new $W.Object (modelType);
  model.vertexCount = vertices.length;
  model.fillArray ("vertex", vertices);
  model.fillArray ("color", colors);
  model.setPosition (0, 0, 0);
  if (rotate) model.animation._update = function() { this.setRotation(-this.age / 60, 0, 0); }
  return model;
}

/**
 * Build the model for a point.
 *
 * \param color The color to render the shape.
 */
function buildPointModel (color) {
  this.model = buildModel ($W.GL.POINTS, [this.vertices], [color], true);
}

/**
 * Builds the model for a MultiPoint.
 *
 * \param color The color to render the shape.
 */
function buildMultiPointModel (color) {
  this.model = buildModel ($W.GL.POINTS, this.points, makeVertexColors (this.points, color), true);
}

/**
 * Builds the models for a Polygon part.
 *
 * \param vertices The main vertex array.
 * \param color The color of the part.
 */
//function buildPolygonPartModel (vertices, color) {
function buildPolygonPartModel (color) {
  var vertices = new Array ();
  vertices.push (this[0]);
  for (var i = 1; i < this.length - 2; ++i) {
    vertices.push (this[i]);
    vertices.push (this[i]);
  }
  vertices.push (this[this.length - 1]);
  this.model = buildModel ($W.GL.LINES, vertices, makeVertexColors (vertices, color), true);
}

/**
 * Builds the models for a Polygon.
 *
 * \param color The color to render the shape.
 */
function buildPolygonModels (color) {
  //var vertices = new Array ();
  //this.eachPart (buildPolygonPartModel, vertices, color);
  this.eachPart (buildPolygonPartModel, color);
  //this.model = buildModel ($W.GL.LINES, vertices, makeVertexColors (vertices, color), true);
  //this.eachModel = function (action) {
  //   action.apply (this.model, stripArgRange (1, arguments.length, arguments));
  //};
}

/**
 * Builds the models for a MultiPatch. MultiPatch is not yet implemented.
 *
 * \param color The color to render the shape.
 */
function buildMultiPatchModels (color) {
  //this.eachModel = function (action) {
  //};
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

