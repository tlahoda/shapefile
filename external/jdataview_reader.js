/**
 * @file jdataview_reader.js Contains the jDataViewReader.
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

var jDataViewReader = Class.create ({
  initialize: function (dataView) {
    this.dataView = dataView;
    this.pos = 0;
  },
  readInt8: function () {
    var res = this.dataView.getInt8 (this.pos);
    ++this.pos;
    return res;
  },
  readUInt8: function () {
    var res = this.dataView.getUInt8 (this.pos);
    ++this.pos;
    return res;
  },
  readInt16: function (littleEndian) {
    var res = this.dataView.getInt16 (this.pos, littleEndian);
    this.pos += 2;
    return res;
  },
  readUInt16: function (littleEndian) {
    var res = this.dataView.getUInt16 (this.pos, littleEndian);
    this.pos += 2;
    return res;
  },
  readInt32: function (littleEndian) {
    var res = this.dataView.getInt32 (this.pos, littleEndian);
    this.pos += 4;
    return res;
  },
  readUInt32: function (littleEndian) {
    var res = this.dataView.getUInt32 (this.pos, littleEndian);
    this.pos += 4;
    return res;
  },
  readFloat: function (littleEndian) {
    var res = this.dataView.getFloat32 (this.pos, littleEndian);
    this.pos += 4;
    return res;
  },
  readDouble: function (littleEndian) {
    var res = this.dataView.getFloat64 (this.pos, littleEndian);
    this.pos += 8;
    return res;
  },
  readChar: function () {
    var res = this.dataView.readChar (this.pos);
    ++this.pos;
    return res;
  },
  readString: function (length) {
    var res = this.dataView.readString (length, this.pos);
    this.pos += length;
    return res;
  },
  seek: function (pos) {
    this.pos = pos;
    this.dataView.seek (pos);
  },
  tell: function () {
    return this.pos;
  }
});

