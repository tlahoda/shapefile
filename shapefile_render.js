/**
 * file shapefile_render.js
 * Contains the shapefile render function.
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

function render (shapeFile, context, color) {
  for (var i = 0; i < shapeFile.header.numShapes; ++i) {
    var shape = shapeFile.shapes[i];

    for (var j = 0; j < shape.header[5]; ++j) {
      var startIndex = shape.header[7 + j];
      var endIndex = (j == shape.header[5] - 1) ? shape.header[6] : shape.header[7 + j + 1];

      var startPoint = ll2Orthoxy (shape.points[startIndex].x, shape.points[startIndex].y);
      context.moveTo (startPoint.x, startPoint.y);

      for (var k = startIndex + 1; k < endIndex; ++k) {
        var temp = ll2Orthoxy (shape.points[k].x, shape.points[k].y);
        context.lineTo (temp.x, temp.y);
      }
    }
  }
  context.strokeStyle = color;
  context.stroke ();
}

