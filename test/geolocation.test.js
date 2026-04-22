import test from "node:test";
import assert from "node:assert/strict";
import { isPointInPolygon } from "../src/geolocation.js";

function makeGeoData(pointCoords, polygonCoords) {
  return {
    features: [
      { geometry: { type: "Point", coordinates: pointCoords } },
      { geometry: { type: "Polygon", coordinates: [polygonCoords] } },
    ],
  };
}

const square = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
  [0, 0],
];

const concavePolygon = [
  [0, 0],
  [6, 0],
  [6, 6],
  [3, 3],
  [0, 6],
  [0, 0],
];

const diagonalPolygon = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 0],
];

test("returns true when point is strictly inside polygon", () => {
  const data = makeGeoData([5, 5], square);
  assert.equal(isPointInPolygon(data), true);
});

test("returns false when point is outside polygon", () => {
  const data = makeGeoData([11, 11], square);
  assert.equal(isPointInPolygon(data), false);
});

test("returns true when point is on polygon boundary", () => {
  const data = makeGeoData([0, 5], square);
  assert.equal(isPointInPolygon(data), true);
});

test("returns false for featureless geojson", () => {
  assert.equal(isPointInPolygon({ features: [] }), false);
});

test("returns true for point inside a concave polygon", () => {
  const data = makeGeoData([1, 1], concavePolygon);
  assert.equal(isPointInPolygon(data), true);
});

test("returns false for point outside a concave polygon", () => {
  const data = makeGeoData([7, 2], concavePolygon);
  assert.equal(isPointInPolygon(data), false);
});

test("returns false for point in a concave cutout (not within the polygon)", () => {
  const data = makeGeoData([3, 5], concavePolygon);
  assert.equal(isPointInPolygon(data), false);
});

test("returns true when point is exactly on a vertex", () => {
  const data = makeGeoData([6, 0], concavePolygon);
  assert.equal(isPointInPolygon(data), true);
});

test("returns false when point coordinates are null", () => {
  assert.equal(isPointInPolygon({
    features: [
      { geometry: { type: "Point", coordinates: null } },
      { geometry: { type: "Polygon", coordinates: [square] } },
    ],
  }), false);
});

test("returns false when polygon coordinates are null", () => {
  assert.equal(isPointInPolygon({
    features: [
      { geometry: { type: "Point", coordinates: [5, 5] } },
      { geometry: { type: "Polygon", coordinates: null } },
    ],
  }), false);
});

test("returns false when geometry is null", () => {
  assert.equal(isPointInPolygon({
    features: [
      { geometry: null },
      { geometry: { type: "Polygon", coordinates: [square] } },
    ],
  }), false);
});

test("returns true when point is on a diagonal edge", () => {
  const data = makeGeoData([5, 5], diagonalPolygon);
  assert.equal(isPointInPolygon(data), true);
});