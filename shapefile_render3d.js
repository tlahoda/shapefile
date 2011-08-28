/**
 * \file shapefile_render3d.js
 * Contains the shapefile three dimensional render functions.
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
var PointRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "Point rendering not implemented.";
  }
});

/**
 * Renders a PointZ point in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointZRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PointZ rendering not implemented.";
  }
});

/**
 * Renders a measured point in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PointMRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PointM rendering not implemented.";
  }
});

/**
 * Renders a set of multiple points in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "MultiPoint rendering not implemented.";
  }
});

/**
 * Renders a set of PointZs in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointZRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "MultiPointZ rendering not implemented.";
  }
});

/**
 * Renders a set of measured points in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPointMRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "MultiPointM rendering not implemented.";
  }
});

/**
 * Renders a polygon in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonRenderer3d = Class.create ({
  initialize: function(shape, context) {
    //the innards of this loop are going to change, just pass array of vertices into webgl.
    for (var j = 0; j < shape.header[5]; ++j) {
      var startPoint = shape.parts[j][0];
      context.beginPath ();
      //context.moveTo (startPoint[0], startPoint[1]);
      
      for (var k = 1; k < shape.parts[j].length; ++k) {
        var temp = shape.parts[j][k];
        //context.lineTo (temp[0], temp[1]);
      }
      context.stroke ();
      context.closePath ();
    }
  }
});

/**
 * Renders a PolygonZ in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonZRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PolygonZ rendering not implemented.";
  }
});

/**
 * Renders a measured polygon in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolygonMRenderer3d = Class.create ({
  initialize: function (shape, context) {
    throw "PolygonM rendering not implemented.";
  }
});

/**
 * Renders a PolyLine in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PolyLine rendering not implemented.";
  }
});

/**
 * Renders a PolyLineZ in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineZRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PolyLineZ rendering not implemented.";
  }
});

/**
 * Renders a PolyLineM in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var PolyLineMRenderer3d = Class.create ({
  initialize: function(shape, context) {
    throw "PolyLineM rendering not implemented.";
  }
});

/**
 * Renders a MultiPatch in a 3d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
var MultiPatchRenderer3d = Class.create ({
  initialize: function (shape, context) {
    throw "MultiPatch rendering not implemented.";
  }
});

/**
 * Calls the appropriate renderer.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function RenderFactory3d (shape, context) {
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need rendering.
      break;
    case 1:
      new PointRenderer3d (shape, context);
      break;
    case 3:
      new PolyLineRenderer3d (shape, context);
      break;
    case 5:
      new PolygonRenderer3d (shape, context);
      break;
    case 8:
      new MultiPointRenderer3d (shape, context);
      break;
    case 11:
      new PointZRenderer3d (shape, context);
      break;
    case 13:
      new PolyLineZRenderer3d (shape, context);
      break;
    case 15:
      new PolygonZRenderer3d (shape, context);
      break;
    case 18:
      new MultiPopintZRenderer3d (shape, context);
      break;
    case 21:
      new PointMRenderer3d (shape, context);
      break;
    case 23:
      new PolyLineMRenderer3d (shape, context);
      break;
    case 25:
      new PolygonMRenderer3d (shape, context);
      break;
    case 28:
      new MultiPointMRenderer3d (shape, context);
      break;
    case 31:
      new MultiPatchRenderer3d (shape, context);
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
function render3d (shapeFile, context, color) {
  context.strokeStyle = color;
  for (var i = 0; i < shapeFile.header.numShapes; ++i)
    RenderFactory3d (shapeFile.shapes[i], context);
}

