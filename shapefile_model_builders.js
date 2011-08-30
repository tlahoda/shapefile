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
 * Build the model for a point.
 *
 * \param color The color to render the shape.
 */
function buildPointModel (color) {
  var data = [["vertex", [this.coords]], 
              ["color", [color]],
              ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

  this.model = $W.createObject({ type: $W.GL.POINTS, data: data });
  this.model.setPosition (0, 0, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
}

/**
 * Builds the model for a MultiPoint.
 *
 * \param color The color to render the shape.
 */
function buildMultiPointModel (color) {
  var colors = new Array ();
  for (var i = 0; i < this.points.length; ++i)
    colors[i] = color;

  var data = [["vertex", this.points], 
              ["color", colors],
              ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

  this.model = $W.createObject({ type: $W.GL.POINTS, data: data });
  this.model.setPosition (0, 0, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
}

/**
 * Colors a part.
 *
 * \param part The part to color.
 * \param color The color to make the part.
 */
function makePolygonPartColors (part, color) {
  var colors = new Array ();
  for (var k = 0; k < part.length; ++k)
    colors[k] = color;
  return colors;
}

/**
 * Builds the models for a polygon part.
 *
 * \param part The part for which to build the models.
 * \param color The color of the part.
 */
function buildPolygonPartModel (color) {
  var data = [["vertex", this], 
              ["color", makePolygonPartColors (this, color)],
              ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

  this.model = $W.createObject({ type: $W.GL.POINTS, data: data });
  this.model.setPosition (0, 1, 0);
  this.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0);}
}

/**
 * Builds the models for a Polygon.
 *
 * \param shape The shape to render.
 * \param color The color to render the shape.
 */
function buildPolygonModels (color) {
  this.eachPart (buildPolygonPartModel, color);
}

/**
 * Builds the models for a MultiPatch.
 *
 * \param shape The shape to render.
 * \param color The color to render the shape.
 */
function buildMultiPatchModels (color) {
  //not yet implemented.
}

/**
 * Builds the models for a shape.
 *
 * \param shape The shape to render.
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

