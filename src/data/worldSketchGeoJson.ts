import type { FeatureCollection, Polygon } from 'geojson';

export const worldSketchGeoJson: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'North America' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-168, 72], [-138, 70], [-122, 58], [-105, 52], [-84, 50], [-60, 54],
          [-54, 46], [-74, 38], [-96, 30], [-112, 24], [-118, 33], [-126, 42],
          [-140, 57], [-168, 72],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Central America' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-112, 24], [-96, 17], [-82, 9], [-78, 4], [-88, 7], [-102, 15],
          [-112, 24],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'South America' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80, 10], [-62, 8], [-44, -4], [-36, -18], [-48, -35], [-66, -55],
          [-76, -38], [-82, -18], [-80, 10],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Greenland' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-72, 83], [-22, 82], [-18, 70], [-44, 60], [-64, 66], [-72, 83],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-11, 36], [-8, 55], [10, 71], [34, 64], [40, 48], [28, 38],
          [8, 36], [-11, 36],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-17, 34], [11, 37], [34, 31], [50, 10], [43, -22], [25, -35],
          [9, -34], [-8, -16], [-17, 8], [-17, 34],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [34, 64], [62, 72], [110, 68], [150, 60], [162, 48], [135, 34],
          [118, 20], [100, 7], [78, 8], [58, 25], [40, 31], [40, 48],
          [34, 64],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Arabia and India' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [42, 31], [58, 25], [77, 8], [88, 22], [78, 30], [58, 30],
          [48, 18], [42, 31],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Southeast Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [96, 22], [116, 18], [124, 6], [112, -8], [100, 2], [96, 22],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Australia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [112, -11], [154, -18], [151, -38], [132, -44], [113, -32],
          [112, -11],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Japan' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [130, 32], [142, 40], [146, 44], [138, 36], [130, 32],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'New Zealand' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [166, -35], [179, -45], [173, -47], [166, -35],
        ]],
      },
    },
  ],
};
