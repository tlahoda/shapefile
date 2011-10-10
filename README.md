Shapefile
=========

Shapefile makes ESRI shapefiles available programmatically. Currently all 
shape types other than MultiPatch have been implemented. MultiPatch is a 
complex shape that will require some thought. Further only Polygon has
been tested as I only have Polygon shapefiles at the moment and have not
taken the time to mock up sample data, although I am fairly confident
the code matches the documentation precisely.

Shapefile is designed to be rendering method agnostic and accomplishes
this by exposing the vertices as lat/lon points that may then be
transformed to the desired projection.

Shapefile is available in both Javascript and Ruby with a C++ version
coming sometime. A Java version may be considered at some point but at
this time I do not intend on writing one.

A live two dimensional orthographic projection example can be found at
http://tlahoda.github.com/shapefile/examples/render2d.html A three 
dimensional WebGL example can be found at 
http://tlahoda.github.com/shapefile/examples/webgl.html . Be forewarned 
this demo may take a long time to load (as in a minute or so) on some 
browsers (namely firefox). It is best viewed in Google Chrome.

Usage
-----


--------------------------------------------------------------------------
####Copyright (C) 2011 Thomas P. Lahoda

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  
02110-1301  USA

