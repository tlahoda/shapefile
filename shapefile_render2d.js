/**
 * \file shapefile_render2d.js
 * Contains the shapefile two dimensional render functions.
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
 * Renders a point in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointRenderer2d = Class.create ({
  initialize: function (shape, context) {
    context.strokeRect (shape.coords[0], shape.coords[1], 1, 1);
  }
});

/**
 * Renders a PointZ point in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointZRenderer2d = Class.create (PointRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a measured point in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointMRenderer2d = Class.create (PointRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a set of multiple points in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointRenderer2d = Class.create ({
  initialize: function (shape, context) {
    for (var i = 0; i < shape.header[5]; ++i)
      context.strokeRect (shape.points[i][0], shape.points[i][1], 1, 1);
  }
});

/**
 * Renders a set of PointZs in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointZRenderer2d = Class.create ({
  initialize: function (shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a set of PointMs in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointMRenderer2d = Class.create ({
  initialize: function (shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a polygon in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonRenderer2d = Class.create ({
  initialize: function (shape, context) {
    for (var i = 0; i < shape.header[5]; ++i) {
      var startPoint = shape.parts[i][0];
      context.beginPath ();
      context.moveTo (startPoint[0], startPoint[1]);
      
      for (var j = 1; j < shape.parts[i].length; ++j) {
        var temp = shape.parts[i][j];
        context.lineTo (temp[0], temp[1]);
      }
      context.stroke ();
      context.closePath ();
    }
  }
});

/**
 * Renders a PolygonZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonZRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a measured polygon in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonMRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a PolygonZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonZRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a PolyLine in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a PolyLineZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineZRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a PolyLineM in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineMRenderer2d = Class.create (PolygonRenderer2d, {
  initialize: function ($super, shape, context) {
    $super (shape, context);
  }
});

/**
 * Renders a MultiPatch in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPatchRenderer2d = Class.create ({
  initialize: function (shape, context) {
  }
});

/**
 * Calls the appropriate renderer.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 *
 * \throw error On unknown shape type.
 */
function RenderFactory2d (shape, context) {
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need rendering. 
      break;
    case 1:
      new PointRenderer2d (shape, context);
      break;
    case 3:
      new PolyLineRenderer2d (shape, context);
      break;
    case 5:
      new PolygonRenderer2d (shape, context);
      break;
    case 8:
      new MultiPointRenderer2d (shape, context);
      break;
    case 11:
      new PointZRenderer2d (shape, context);
      break;
    case 13:
      new PolyLineZRenderer2d (shape, context);
      break;
    case 15:
      new PolygonZRenderer2d (shape, context);
      break;
    case 18:
      new MultiPopintZRenderer2d (shape, context);
      break;
    case 21:
      new PointMRenderer2d (shape, context);
      break;
    case 23:
      new PolyLineMRenderer2d (shape, context);
      break;
    case 25:
      new PolygonMRenderer2d (shape, context);
      break;
    case 28:
      new MultiPointMRenderer2d (shape, context);
      break;
    case 31:
      new MultiPatchRenderer2d (shape, context);
      break;
    default:
      throw "Shape type unknown.";
  }
}

/**
 * Renders a shapefile in a two dimensional orthographic projection.
 *
 * \param shapeFile The shapefile.
 * \param context The canvas onto which to draw.
 * \param color, The color to render the shapes.
 *
 * \throw error On trying to render an unknown shape type.
 */
function render2d (shapeFile, context, color) {
  context.strokeStyle = color;
  for (var i = 0; i < shapeFile.header.numShapes; ++i)
    RenderFactory2d (shapeFile.shapes[i], context);
}

