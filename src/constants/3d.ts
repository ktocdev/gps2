/**
 * 3D Environment Shared Constants
 *
 * Centralizes all configuration values used across 3D composables
 * to ensure consistency and ease of maintenance.
 */

// Grid Configuration
export const GRID_CONFIG = {
  COLS: 14,
  ROWS: 10,
  CELL_SIZE: 3.0,
  PIXELS_PER_CELL: 64,
  get WIDTH() {
    return this.COLS * this.CELL_SIZE
  },
  get DEPTH() {
    return this.ROWS * this.CELL_SIZE
  },
} as const

// Camera Configuration
export const CAMERA_CONFIG = {
  FOV: 45,
  NEAR: 0.1,
  FAR: 1000,
  INITIAL_POSITION: { x: 10, y: 15, z: 30 } as const,
  HEIGHT_MIN: 0.5,
  HEIGHT_MAX: 20,
  MOUSE_ROTATION_SPEED: 0.01,
  WHEEL_ZOOM_SPEED: 0.01,
  PAN_SPEED: 0.15,
  VERTICAL_SPEED: 0.1,
  KEYBOARD_ROTATION_SPEED: 0.03,
  TILT_OFFSET_BASE: 5,
  TILT_OFFSET_MULTIPLIER: 0.5,
} as const

// Scene Colors
export const SCENE_COLORS = {
  SKY: 0x87CEEB,
  AMBIENT_LIGHT: 0xffffff,
  DIRECTIONAL_LIGHT: 0xffffff,
  BACK_LIGHT: 0xccccff,
} as const

// Lighting Configuration
export const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.5,
  DIRECTIONAL_INTENSITY: 0.8,
  BACK_LIGHT_INTENSITY: 0.4,
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA_BOUNDS: 30,
} as const

// Environment Configuration
export const ENVIRONMENT_CONFIG = {
  WALL_HEIGHT: 2.0,
  WALL_THICKNESS: 0.5,
  BEDDING_TEXTURE_SIZE: 1024,
  BEDDING_PIECES: 5000,
} as const

// Guinea Pig Model Configuration
export const GUINEA_PIG_CONFIG = {
  DEFAULT_COLORS: {
    FUR: 0xd4a574,
    MARKINGS: 0xffffff,
    EAR_INNER: 0xffb6c1,
    EYE: 0x000000,
  } as const,
  MATERIAL: {
    FUR_ROUGHNESS: 0.9,
    EAR_ROUGHNESS: 0.8,
    SKIN_ROUGHNESS: 0.5,
    EYE_ROUGHNESS: 0.0,
    EYE_CLEARCOAT: 1.0,
    EYE_CLEARCOAT_ROUGHNESS: 0.1,
  } as const,
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  MOVEMENT_THRESHOLD: 0.01,
  SELECTION_RING: {
    INNER_RADIUS: 0.8,
    OUTER_RADIUS: 1.0,
    Y_OFFSET: 0.05,
    COLOR: 0x00ff00,
    OPACITY: 0.6,
    PULSE_SPEED: 0.002,
    PULSE_AMPLITUDE: 0.1,
  } as const,
} as const

// Item Model Configuration
export const ITEM_CONFIG = {
  // Hay Configuration (Simplified for performance)
  HAY: {
    COLORS: [0xfffacd, 0xffe4b5, 0xdaa520, 0xc0d9af, 0xeedd82] as const,
    INSTANCES_UPRIGHT: 250,
    INSTANCES_FLAT: 250,
    STRAND_WIDTH: 0.08,
    STRAND_THICKNESS: 0.015,
  } as const,

  // Wood Texture
  WOOD_TEXTURE_SIZE: 512,

  // Food Positions in Bowl
  FOOD_POSITION: {
    SINGLE: { x: 0, y: 1.6, z: 0 } as const,
    LEFT: { x: -0.8, y: 1.6, z: 0.3 } as const,
    RIGHT: { x: 0.8, y: 1.6, z: -0.3 } as const,
  } as const,
} as const
