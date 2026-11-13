/**
 * The eight module tiles on Smooth ERP's home screen (01-module-home.png), as crops in percent of
 * the capture, and where each sits on the scene's arc (percent of the stage).
 */
const column = [11.18, 31.18, 51.18, 71.18];
const row = [31.44, 56.11];
const crop = (c: number, r: number) => ({ x: column[c], y: row[r], w: 17.64, h: 16 });

const arc = [
  { left: 26, top: 14, rotate: -6 },
  { left: 35, top: 9, rotate: -4 },
  { left: 44, top: 6, rotate: -2 },
  { left: 53, top: 4, rotate: -1 },
  { left: 62, top: 4, rotate: 1 },
  { left: 71, top: 6, rotate: 2 },
  { left: 80, top: 9, rotate: 4 },
  { left: 89, top: 14, rotate: 6 },
];

export const selectedWorkTiles = [
  { name: "Accounting", crop: crop(0, 0) },
  { name: "Inventories", crop: crop(1, 0) },
  { name: "Sales", crop: crop(2, 0) },
  { name: "Purchases", crop: crop(3, 0) },
  { name: "Point of Sale", crop: crop(1, 1) },
  { name: "Construction", crop: crop(0, 1) },
  { name: "Equipment", crop: crop(2, 1) },
  { name: "Settings", crop: crop(3, 1) },
].map((tile, index) => ({ ...tile, ...arc[index] }));
