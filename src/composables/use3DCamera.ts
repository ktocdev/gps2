import { ref } from 'vue'
import type * as THREE from 'three'
import { CAMERA_CONFIG } from '../constants/3d'

export interface CameraControls {
  isDragging: boolean
  previousMousePosition: { x: number; y: number }
  keysPressed: Record<string, boolean>
  isHovering: boolean
}

export function use3DCamera(
  camera: THREE.PerspectiveCamera,
  worldGroup: THREE.Group,
  canvasElement: HTMLCanvasElement,
  options?: { disableArrowKeys?: () => boolean }
) {
  const controls = ref<CameraControls>({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    keysPressed: {},
    isHovering: false,
  })

  // Mouse Rotation
  function handleMouseDown(e: MouseEvent) {
    controls.value.isDragging = true
    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!controls.value.isDragging) return

    const deltaMove = {
      x: e.offsetX - controls.value.previousMousePosition.x,
      y: e.offsetY - controls.value.previousMousePosition.y,
    }

    // Rotate world on Y-axis
    worldGroup.rotation.y += deltaMove.x * CAMERA_CONFIG.MOUSE_ROTATION_SPEED

    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseUp() {
    controls.value.isDragging = false
  }

  // Scroll Zoom
  function handleWheel(e: WheelEvent) {
    // Only zoom when hovering over canvas
    if (controls.value.isHovering) {
      e.preventDefault() // Prevent page scroll
      camera.position.y += e.deltaY * CAMERA_CONFIG.WHEEL_ZOOM_SPEED
      camera.position.y = Math.max(
        CAMERA_CONFIG.HEIGHT_MIN,
        Math.min(CAMERA_CONFIG.HEIGHT_MAX, camera.position.y)
      )
    }
  }

  // Mouse Hover Tracking
  function handleMouseEnter() {
    controls.value.isHovering = true
  }

  function handleMouseLeave() {
    controls.value.isHovering = false
  }

  // Keyboard Controls
  function handleKeyDown(e: KeyboardEvent) {
    // Prevent page scroll when hovering over canvas
    if (controls.value.isHovering) {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x', 'Z', 'X', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']
      if (scrollKeys.includes(e.key) || scrollKeys.includes(e.code)) {
        e.preventDefault()
      }
    }

    controls.value.keysPressed[e.key.toLowerCase()] = true
    controls.value.keysPressed[e.code] = true
  }

  function handleKeyUp(e: KeyboardEvent) {
    controls.value.keysPressed[e.key.toLowerCase()] = false
    controls.value.keysPressed[e.code] = false
  }

  // Touch Controls
  function handleTouchStart(e: TouchEvent) {
    controls.value.isDragging = true
    controls.value.previousMousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!controls.value.isDragging) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY

    worldGroup.rotation.y +=
      (currentX - controls.value.previousMousePosition.x) * CAMERA_CONFIG.MOUSE_ROTATION_SPEED

    controls.value.previousMousePosition = { x: currentX, y: currentY }
  }

  function handleTouchEnd() {
    controls.value.isDragging = false
  }

  // Update camera position based on keyboard input
  function updateCameraPosition() {
    // Check if arrow keys should be disabled (e.g., during Take Control mode)
    const arrowsDisabled = options?.disableArrowKeys?.() ?? false

    // WASD always controls camera (A/D = left/right, W/S = forward/back)
    if (controls.value.keysPressed['a']) camera.position.x -= CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['d']) camera.position.x += CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['w']) camera.position.z -= CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['s']) camera.position.z += CAMERA_CONFIG.PAN_SPEED

    // Arrow keys control camera only when not disabled
    if (!arrowsDisabled) {
      if (controls.value.keysPressed['arrowleft']) camera.position.x -= CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowright']) camera.position.x += CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowup']) camera.position.z -= CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowdown']) camera.position.z += CAMERA_CONFIG.PAN_SPEED
    }

    // Z/X for vertical movement (always available)
    if (controls.value.keysPressed['z']) camera.position.y += CAMERA_CONFIG.VERTICAL_SPEED
    if (controls.value.keysPressed['x']) camera.position.y -= CAMERA_CONFIG.VERTICAL_SPEED

    // Alternate rotation keys
    if (controls.value.keysPressed[','] || controls.value.keysPressed['<']) {
      worldGroup.rotation.y -= CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }
    if (controls.value.keysPressed['.'] || controls.value.keysPressed['>']) {
      worldGroup.rotation.y += CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }

    // Clamp camera position to world boundaries
    camera.position.x = Math.max(
      CAMERA_CONFIG.BOUND_X_MIN,
      Math.min(CAMERA_CONFIG.BOUND_X_MAX, camera.position.x)
    )
    camera.position.y = Math.max(
      CAMERA_CONFIG.HEIGHT_MIN,
      Math.min(CAMERA_CONFIG.HEIGHT_MAX, camera.position.y)
    )
    camera.position.z = Math.max(
      CAMERA_CONFIG.BOUND_Z_MIN,
      Math.min(CAMERA_CONFIG.BOUND_Z_MAX, camera.position.z)
    )

    // Update camera look-at with tilt
    const tiltOffset = CAMERA_CONFIG.TILT_OFFSET_BASE + camera.position.y * CAMERA_CONFIG.TILT_OFFSET_MULTIPLIER
    camera.lookAt(camera.position.x, 2.0, camera.position.z - tiltOffset)
  }

  // Initialize event listeners
  function init() {
    // Mouse events
    canvasElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Mouse hover tracking
    canvasElement.addEventListener('mouseenter', handleMouseEnter)
    canvasElement.addEventListener('mouseleave', handleMouseLeave)

    // Scroll - non-passive so we can preventDefault when hovering
    canvasElement.addEventListener('wheel', handleWheel, { passive: false })

    // Keyboard
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Touch - use passive for better scroll performance
    canvasElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvasElement.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvasElement.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Cleanup event listeners
  function cleanup() {
    canvasElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    canvasElement.removeEventListener('mouseenter', handleMouseEnter)
    canvasElement.removeEventListener('mouseleave', handleMouseLeave)
    canvasElement.removeEventListener('wheel', handleWheel)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    canvasElement.removeEventListener('touchstart', handleTouchStart)
    canvasElement.removeEventListener('touchmove', handleTouchMove)
    canvasElement.removeEventListener('touchend', handleTouchEnd)
  }

  // Auto-initialize
  init()

  return {
    controls,
    updateCameraPosition,
    cleanup,
  }
}
