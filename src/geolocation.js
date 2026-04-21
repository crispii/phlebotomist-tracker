export function getPointAndPolygonCoords(data) {
  if (!data || !data.features) {
    return null;
  }

  // Find the point and polygon features in the geoJSON data
  const point = data.features.find(
    (feature) => feature.geometry?.type === "Point",
  );
  const polygon = data.features.find(
    (feature) => feature.geometry?.type === "Polygon",
  );

  if (!point || !polygon) {
    return null;
  }

  // Extract the coordinates from the point and polygon features
  const pointCoords = point.geometry.coordinates;
  const polygonCoords = polygon.geometry.coordinates[0];

  return { pointCoords, polygonCoords };
}

export function isPointInPolygon(data) {
  const { pointCoords, polygonCoords } = getPointAndPolygonCoords(data);
  if (!pointCoords || !polygonCoords) {
    return false;
  }
  // Extract x and y coordinates from the point
  const [x, y] = pointCoords;

  // Extract x and y coordinates from the polygon vertices
  const xCoords = polygonCoords.map((coord) => coord[0]);
  const yCoords = polygonCoords.map((coord) => coord[1]);

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  // Check if the point is within the bounding box of the polygon
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}
