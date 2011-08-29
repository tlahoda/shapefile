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
 * Renders a point in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointBuilder = Class.create ({
  initialize: function (shape, color) {
    var data = [["vertex", shape.coords], 
                ["color", color],
                ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

    shape.model = $W.createObject({ type: $W.GL.POINTS, data: data });
    shape.model.setPosition (0, 0, 0);
    shape.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
  }
});

/**
 * Renders a PointZ point in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointZBuilder = Class.create (PointBuilder, {
  initialize: function ($super, shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a measured point in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointMBuilder = Class.create (PointBuilder, {
  initialize: function ($super, shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a set of multiple points in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointBuilder = Class.create ({
  initialize: function (shape, color) {
    var colors = new Array ();
    for (var i = 0; i < shape.points.length; ++i)
      colors[i] = color;
  
    var data = [["vertex", shape.points], 
                ["color", colors],
                ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

    shape.model = $W.createObject({ type: $W.GL.POINTS, data: data });
    shape.model.setPosition (0, 0, 0);
    shape.model.animation._update = function() { this.setRotation(this.age / 60, 0, 0); }
  }
});

/**
 * Renders a set of PointZs in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointZBuilder = Class.create (MultiPointBuilder, {
  initialize: function ($super, shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a set of measured points in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointMBuilder = Class.create (MultiPointBuilder, {
  initialize: function ($super, shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a polygon in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonBuilder = Class.create ({
  initialize: function (shape, color) {
    shape.models = new Array (shape.parts.length);

    for (var j = 0; j < shape.parts.length; ++j) {
      var part = shape.parts[j];

      var colors = new Array ();
      for (var k = 0; k < part.length; ++k)
        colors[k] = color;

      var data = [["vertex", part], 
                  ["color", colors],
                  ["wglu_elements", [0, 1, 2, 0, 3, 4, 0, 3, 1, 0, 2, 4]]];

      shape.models[j] = $W.createObject({ type: $W.GL.LINE_LOOP, data: data });
      shape.models[j].setPosition (0, 1, 0);
      shape.models[j].animation._update = function() { this.setRotation(this.age / 60, 0, 0);}
    }
  }
});

/**
 * Renders a PolygonZ in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonZBuilder = Class.create (PolygonBuilder, {
  initialize: function ($super, shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a measured polygon in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonMBuilder = Class.create (PolygonBuilder, {
  initialize: function (shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a PolyLine in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineBuilder = Class.create (PolygonBuilder, {
  initialize: function(shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a PolyLineZ in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineZBuilder = Class.create (PolygonBuilder, {
  initialize: function(shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a PolyLineM in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineMBuilder = Class.create (PolygonBuilder, {
  initialize: function(shape, color) {
    $super (shape, color);
  }
});

/**
 * Renders a MultiPatch in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPatchBuilder = Class.create ({
  initialize: function (shape, color) {
    throw "MultiPatch rendering not implemented.";
  }
});

/**
 * Calls the appropriate renderer.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function ModelBuilderFactory (shape, color) {
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need rendering.
      break;
    case 1:
      new PointBuilder (shape, color);
      break;
    case 3:
      new PolyLineBuilder (shape, color);
      break;
    case 5:
      new PolygonBuilder (shape, color);
      break;
    case 8:
      new MultiPointBuilder (shape, color);
      break;
    case 11:
      new PointZBuilder (shape, color);
      break;
    case 13:
      new PolyLineZBuilder (shape, color);
      break;
    case 15:
      new PolygonZBuilder (shape, color);
      break;
    case 18:
      new MultiPopintZBuilder (shape, color);
      break;
    case 21:
      new PointMBuilder (shape, color);
      break;
    case 23:
      new PolyLineMBuilder (shape, color);
      break;
    case 25:
      new PolygonMBuilder (shape, color);
      break;
    case 28:
      new MultiPointMBuilder (shape, color);
      break;
    case 31:
      new MultiPatchBuilder (shape, color);
      break;
    default:
      throw "Shape type unknown.";
  }
}

/**
 * Renders a shapefile in 3d.
 *
 * \param shapeFile The shapefile.
 * \param context The canvas onto which to draw.
 * \param color, The color to render the shapes.
 */
function buildModels (shapeFile, color) {
  //for (var i = 0; i < shapeFile.header.numShapes; ++i)
    ModelBuilderFactory (shapeFile.shapes[27], color);
}

