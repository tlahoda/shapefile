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
 * Represents a color.
 */
var Color = Class.create ({
  R: 0,
  G: 1,
  B: 2,
  A: 3,
  
  /**
   * Creates a Color.
   *
   * \param r The red channel intensity.
   * \param g The green channel intensity.
   * \param b The blue channel intensity.
   * \param a The alpha channel intensity.
   */
  initialize: function (r, g, b, a) {
      this.data = [r & 0xFF, g & 0xFF, b & 0xFF, a & 0xFF];
  },

  /**
   * Converts the color to an RGB string.
   *
   * \return The RGB string.
   */
  to_rgb_string: function () {
      var r = this.data[this.R];
      var g = this.data[this.G];
      var b = this.data[this.B];
      return "#" + ((r < 10) ? "0" : "") + r.toString (16) + ((g < 10) ? "0" : "") + g.toString (16) + 
             ((b < 10) ? "0" : "") + b.toString (16);
  },

  /**
   * Converts the color to an RGBA string.
   *
   * \return The RGBA string.
   */
  to_rgba_string: function () {
      var r = this.data[this.R];
      var g = this.data[this.G];
      var b = this.data[this.B];
      var a = this.data[this.A];
      return "#" + ((r < 10) ? "0" : "") + r.toString (16) + ((g < 10) ? "0" : "") + g.toString (16) + 
             ((b < 10) ? "0" : "") + b.toString (16) + ((a < 10) ? "0" : "") + a.toString (16);
  }
});

/**
 * Draws a point onto context.
 *
 * \param point The point
 * \param context The onto onto which to draw.
 */
function drawPoint (point, context) {
  context.strokeRect (point[0], point[1], 1, 1);
}

/**
 * Renders a Point onto context.
 *
 * \param shape The Point shape.
 * \param context The conext onto which to render.
 */
function renderPoint (shape, context) {
  drawPoint (shape.coords, context);
}

/**
 * Renders a MultiPoint onto context.
 *
 * \param shape The MultiPoint shape.
 * \param context The conext onto which to render.
 */
function renderMultiPoint (shape, context) {
  shape.eachVertex (drawPoint, context);
}

/**
 * Renders a Polygon part onto context.
 *
 * \param shape The Polygon part.
 * \param context The conext onto which to render.
 */
function renderPolygonPart (part, context) {
  var startPoint = part[0];
  context.beginPath ();
  context.moveTo (startPoint[0], startPoint[1]);
  
  for (var i = 1; i < part.length; ++i) {
    var temp = part[i];
    context.lineTo (temp[0], temp[1]);
  }
  context.stroke ();
  context.closePath ();
}

/**
 * Renders a Polygon onto context.
 *
 * \param shape The Polygon shape.
 * \param context The conext onto which to render.
 */
function renderPolygon (shape, context) {
  shape.eachPart (renderPolygonPart, context);
}

/**
 * Renders a MultiPatch onto context.
 *
 * \param shape The MultiPatch shape.
 * \param context The context onto which to render.
 */
function renderMultiPatch (shape, context) {
  //not yet implemented.
}

/**
 * Renders a shape onto a context in the given color.
 *
 * \param shape The shape to render.
 * \param context The context onto which to render.
 *
 * \throw error On unknown shape type.
 */
function render (shape, context, color) {
  context.strokeStyle = color.to_rgb_string ();
  switch (shape.header[0]) {
    case 0:
      //NullShape does not need rendering. 
      break;
    case 1: //Point
    case 11: //PointZ
    case 21: //PointM
      renderPoint.apply (null, arguments);
      break;
    case 8: //MultiPoint
    case 18: //MultiPointZ
    case 28: //MultiPointM
      renderMultiPoint.apply (null, arguments);
      break;
    case 5: //Polygon
    case 15: //PolygonZ
    case 25: //PolygonM
    case 3: //PolyLine
    case 13: //PolyLineZ
    case 23: //PolyLineM
      renderPolygon.apply (null, arguments);
      break;
    case 31: //MultiPatch
      renderMultiPatch.apply (null, arguments);
      break;
    default:
      throw "Shape type unknown.";
    return shape;
  }
}

