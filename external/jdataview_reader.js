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

