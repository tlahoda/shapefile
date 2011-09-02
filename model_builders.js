/**
 * \file model_builders.js
 * Contains the three dimensional model builders.
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
 * \param ele The element.
 * \param value The value with which to fill.
 *
 * \return The value.
 */
function set (ele, value) {
  return value;
}

/**
 * Makes an array of colors for ian array of vertices.
 *
 * \param vertices The array of vertices for whic hto generate colors.
 * \param color The color to make the vertices.
 *
 * \return The array of colors.
 */
function makeVertexColors (vertices, colors) {
  var newColors = new Array (vertices.length);
  for (var i = 0, j = 0; i < vertices.length; ++i) {
    newColors[i] = colors[j];
    if (++j >= colors.length) j = 0;
  }
  return newColors;
}

/**
 * Builds a model.
 *
 * \param modelType The type of the model.
 * \param vertices The model vertices.
 * \param colors The model colors.
 *
 * \return The model.
 */
function buildModel (modelType, vertices, colors) {
  var model = new $W.Object (modelType);
  model.vertexCount = vertices.length;
  model.fillArray ("vertex", vertices);
  model.fillArray ("color", makeVertexColors (vertices, colors));
  return model;
}

/**
 * Build the model for a point.
 *
 * \param shape The shape.
 * \param vertices The vertices.
 */
function addPoint (shape, vertices) {
  vertices.push ([shape.coords]);
}

/**
 * Builds the model for a MultiPoint.
 *
 * \param shape The shape.
 * \param vertices The vertices.
 */
function addMultiPoint (shape, vertices) {
  vertices.push.apply (vertices, shape);
}

/**
 * Builds the vertices for a Polygon part.
 *
 * \param part The part.
 * \param vertices The vertices.
 */
function addPolygonPart (part, vertices) {
  vertices.push (part[0]);
  var length = part.length;
  for (var i = 1; i < length - 2; ++i) {
    vertices.push (part[i]);
    vertices.push (part[i]);
  }
  vertices.push (part[length - 1]);
}

/**
 * Builds the models for a Polygon.
 *
 * \param shape The shape.
 * \param vertices The vertices.
 */
function addPolygon (shape, vertices) {
  shape.parts.for_each (addPolygonPart, vertices);
}

/**
 * Builds the models for a MultiPatch. MultiPatch is not yet implemented.
 *
 * \param shape The shape.
 * \param vertices The vertices.
 */
function addMultiPatch (shape, vertices) {
}

/**
 * Builds the models for a shape.
 *
 * \param shape The shape.
 * \param colors The colors to render the shapes.
 */
function buildModels (shape, colors) {
  var vertices = new Array ();
  var modelType = $W.GL.LINES;
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need a model.
      break;
    case 1: //Point
    case 11: //PointZ
    case 21: //PointM
      addPoint (shape, vertices);
      break;
    case 8: //MultiPoint
    case 18: //MultiPointZ
    case 28: //MultiPointM
      addMultiPoint (shape, vertices);
      break;
    case 3: //PolyLine
    case 5: //Polygon
    case 13: //PolyLineZ
    case 15: //PolygonZ
    case 23: //PolyLineM
    case 25: //PolygonM
      addPolygon (shape, vertices);
      break;
    case 31: //MultiPatch
      addMultiPatch (shape, vertices);
      break;
    default:
      throw "Shape type unknown.";
  }
  shape.model = buildModel (modelType, vertices, colors);
}

