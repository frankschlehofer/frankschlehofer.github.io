// Content stays in index.html. These IDs only place that content in the world.
export const SPAWN = { x: 0, z: 5, yaw: 0 };
export const WORLD_LIMIT = 21;
export const WALK_SPEED = 4.5;
export const REACH = 4;
export const SIGN = { offsetX: 2.4, y: 1.35, width: 3, height: 1.5 };
export const EXHIBITS = [
  { id: 'work-garmin', label: 'GARMIN', kind: 'hangar', color: '#8cbddd', x: -11, z: -8, arrival: { x: -8.6, z: -1.8, yaw: 0 } },
  { id: 'project-slayterhil', label: 'SLAYTER HIL', kind: 'lab', color: '#e6c461', x: -4, z: -14, arrival: { x: -1.6, z: -7.8, yaw: 0 } },
  { id: 'project-fridge', label: 'FRANKIE’S FRIDGE', kind: 'kitchen', color: '#b4ce82', x: 6, z: -12, arrival: { x: 8.4, z: -5.8, yaw: 0 } },
  { id: 'project-movies', label: 'MOVIE RECOMMENDER', kind: 'study', color: '#c6a8da', x: 12, z: -2, arrival: { x: 14.4, z: 4.2, yaw: 0 } }
];
