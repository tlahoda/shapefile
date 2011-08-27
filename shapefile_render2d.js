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
function PointRenderer2d (shape, context) {
  throw "Point rendering not implemented.";
}

/**
 * Renders a PointZ point in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PointZRenderer2d (shape, context) {
  throw "PointZ rendering not implemented.";
}

/**
 * Renders a measured point in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PointMRenderer2d (shape, context) {
  throw "PointM rendering not implemented.";
}

/**
 * Renders a set of multiple points in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function MultiPointRenderer2d (shape, context) {
  throw "MultiPoint rendering not implemented.";
}

/**
 * Renders a set of PointZs in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function MultiPointZRenderer2d (shape, context) {
  throw "MultiPointZ rendering not implemented.";
}

/**
 * Renders a PolyLineZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PolyLineZRenderer2d (shape, context) {
  throw "PolyLineZ rendering not implemented.";
}

/**
 * Renders a polygon in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PolygonRenderer2d (shape, context) {
  for (var j = 0; j < shape.header[5]; ++j) {
    var startPoint = shape.parts[j][0];
    context.beginPath ();
    context.moveTo (startPoint[0], startPoint[1]);
    
    for (var k = 1; k < shape.parts[j].length; ++k) {
      var temp = shape.parts[j][k];
      context.lineTo (temp[0], temp[1]);
    }
    context.stroke ();
    context.closePath ();
  }
}

/**
 * Renders a PolygonZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PolygonZRenderer2d (shape, context) {
  throw "PolygonZ rendering not implemented.";
}

/**
 * Renders a measured polygon in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PolygonMRenderer2d (shape, context) {
  for (var j = 0; j < shape.header[5]; ++j) {
    var startPoint = shape.parts[j][0];
    context.beginPath ();
    context.moveTo (startPoint[0], startPoint[1]);
    
    for (var k = 1; k < shape.parts[j].length; ++k) {
      var temp = shape.parts[j][k];
      context.lineTo (temp[0], temp[1]);
    }
    context.stroke ();
    context.closePath ();
  }
}

/**
 * Renders a PolygonZ in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function PolygonZRenderer2d (shape, context) {
  throw "PolygonZ rendering not implemented.";
}
/**
 * Renders a MultiPatch in a 2d.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function MultiPatchRenderer2d (shape, context) {
  throw "MultiPatch rendering not implemented.";
}

/**
 * Calls the appropriate renderer.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 */
function RenderFactory2d (shape, context) {
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need rendering. 
      break;
    case 1:
      PointRenderer2d (shape, context);
      break;
    case 3:
      //Polyline has the same structure as Polygon so using it for now.
      PolygonRenderer2d (shape, context);
      break;
    case 5:
      PolygonRenderer2d (shape, context);
      break;
    case 8:
      MultiPointRenderer2d (shape, context);
      break;
    case 11:
      PointZRenderer2d (shape, context);
      break;
    case 13:
      PolyLineZRenderer2d (shape, context);
      break;
    case 15:
      PolygonZRenderer2d (shape, context);
      break;
    case 18:
      MultiPopintZRenderer2d (shape, context);
      break;
    case 21:
      PointMRenderer2d (shape, context);
      break;
    case 23:
      //PolylineM has the same structure as PolygonM so using it for now.
      PolygonMRenderer2d (shape, context);
      break;
    case 25:
      PolygonMRenderer2d (shape, context);
      break;
    case 28:
      MultiPointMRenderer2d (shape, context);
      break;
    case 31:
      MultiPatchRenderer2d (shape, context);
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
 */
function render2d (shapeFile, context, color) {
  context.strokeStyle = color;
  for (var i = 0; i < shapeFile.header.numShapes; ++i)
    RenderFactory2d (shapeFile.shapes[i], context);
}

