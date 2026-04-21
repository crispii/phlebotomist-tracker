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
  const coords = getPointAndPolygonCoords(data);
  if (!coords) return false;

  const [x, y] = coords.pointCoords;
  const vertices = coords.polygonCoords;
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];

    const isHorizontalEdge = yi === yj;
    const isVerticalEdge = xi === xj;
    const onHorizontalEdge =
      isHorizontalEdge &&
      y === yi &&
      x >= Math.min(xi, xj) &&
      x <= Math.max(xi, xj);
    const onVerticalEdge =
      isVerticalEdge &&
      x === xi &&
      y >= Math.min(yi, yj) &&
      y <= Math.max(yi, yj);

    if (onHorizontalEdge || onVerticalEdge) return true;

    const rayCouldCross = yi > y !== yj > y;
    const edgeCrossingX = ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    const crossingIsToTheRight = x < edgeCrossingX;

    if (rayCouldCross && crossingIsToTheRight) {
      inside = !inside;
    }
  }

  return inside;
}
