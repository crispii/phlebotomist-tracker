export function getPointAndPolygonCoords(data) {
  if (!data || !data.features) {
    return null;
  }

  const point = data.features.find(
    (feature) => feature.geometry?.type === "Point",
  );
  const polygon = data.features.find(
    (feature) => feature.geometry?.type === "Polygon",
  );

  if (!point || !polygon) {
    return null;
  }

  const pointCoords = point.geometry.coordinates;
  const polygonCoords = polygon.geometry.coordinates[0];

  return { pointCoords, polygonCoords };
}

export function isPointInPolygon(data) {
  const { pointCoords, polygonCoords } = getPointAndPolygonCoords(data);
  if (!pointCoords || !polygonCoords) {
    return false;
  }
  const [x, y] = pointCoords;

  const xCoords = polygonCoords.map((coord) => coord[0]);
  const yCoords = polygonCoords.map((coord) => coord[1]);

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}
