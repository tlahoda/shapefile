/**
 * \file render2d.js
 * Contains the two dimensional render functions.
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
  
  /**
   * Creates a Color.
   *
   * \param r The red channel intensity.
   * \param g The green channel intensity.
   * \param b The blue channel intensity.
   */
  initialize: function (r, g, b) {
    this.data = [r & 0xFF, g & 0xFF, b & 0xFF];
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
});

/**
 * Draws a point onto context.
 *
 * \param context The onto onto which to draw.
 */
function drawPoint (context) {
  context.strokeRect (this[0], this[1], 1, 1);
}

/**
 * Renders a Point onto context.
 *
 * \param context The conext onto which to render.
 */
function renderPoint (context) {
  drawPoint.apply (this.coords, context);
}

/**
 * Renders a MultiPoint onto context.
 *
 * \param context The conext onto which to render.
 */
function renderMultiPoint (context) {
  this.eachVertex (drawPoint, context);
}

/**
 * Renders a Polygon part onto context.
 *
 * \param context The conext onto which to render.
 */
function renderPolygonPart (context) {
  context.beginPath ();
  context.moveTo (this[0][0], this[0][1]);
  this.forEachRange (1, this.length, function () { context.lineTo (this[0], this[1]); });
  context.stroke ();
  context.closePath ();
}

/**
 * Renders a Polygon onto context.
 *
 * \param context The conext onto which to render.
 */
function renderPolygon (context) {
  this.eachPart (renderPolygonPart, context);
}

/**
 * Renders a MultiPatch onto context.
 *
 * \param context The context onto which to render.
 */
function renderMultiPatch (context) {
  //not yet implemented.
}

/**
 * Renders a shape onto a context in the given color.
 *
 * \param context The context onto which to render.
 *
 * \throw error On unknown shape type.
 */
function render (context, color) {
  context.strokeStyle = color.to_rgb_string ();
  switch (this.header[0]) {
    case 0:
      //NullShape does not need rendering. 
      break;
    case 1: //Point
    case 11: //PointZ
    case 21: //PointM
      renderPoint.apply (this, arguments);
      break;
    case 8: //MultiPoint
    case 18: //MultiPointZ
    case 28: //MultiPointM
      renderMultiPoint.apply (this, arguments);
      break;
    case 5: //Polygon
    case 15: //PolygonZ
    case 25: //PolygonM
    case 3: //PolyLine
    case 13: //PolyLineZ
    case 23: //PolyLineM
      renderPolygon.apply (this, arguments);
      break;
    case 31: //MultiPatch
      renderMultiPatch.apply (this, arguments);
      break;
    default:
      throw "Shape type unknown.";
  }
}

