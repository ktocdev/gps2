<template>
  <div class="habitat-3d-debug debug-view__constrained">
    <h2>3D Habitat View</h2>

    <div class="panel panel--full-width">
      <div class="panel__content">
        <div class="habitat-3d-debug__info">
          Drag or &lt; &gt; to rotate | Scroll/Z/X for Up/Down | Arrows to pan
        </div>
        <div class="habitat-3d-debug__canvas-wrapper">
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use3DScene } from '../../../composables/use3DScene'
import { use3DCamera } from '../../../composables/use3DCamera'
import { use3DSync } from '../../../composables/use3DSync'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Initialize 3D scene
const { camera, worldGroup } = use3DScene(canvasRef)

// Initialize camera controls
let updateCameraPosition: () => void

onMounted(() => {
  if (!canvasRef.value) return

  // Setup camera controls
  const cameraControls = use3DCamera(camera, worldGroup, canvasRef.value)
  updateCameraPosition = cameraControls.updateCameraPosition

  // Setup position sync
  use3DSync(worldGroup)

  // Add basic environment
  addEnvironment()

  // Start animation loop
  animate()
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  // Update camera position based on keyboard input
  if (updateCameraPosition) {
    updateCameraPosition()
  }
}

// Add basic environment (floor)
function addEnvironment() {
  // Create bedding texture
  const beddingTexture = createBeddingTexture()

  // Floor
  const floorGeo = new THREE.PlaneGeometry(14, 10) // Match grid size
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: beddingTexture,
    roughness: 1.0,
    metalness: 0.0,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2 // Rotate to horizontal
  floor.receiveShadow = true
  worldGroup.add(floor)

  // Walls
  const wallHeight = 0.5
  const wallThickness = 0.5
  const floorSize = 10 // Adjusted for 10 row depth

  const wallGeoH = new THREE.BoxGeometry(14 + wallThickness * 2, wallHeight, wallThickness)
  const wallGeoV = new THREE.BoxGeometry(wallThickness, wallHeight, floorSize)

  const wall1 = new THREE.Mesh(wallGeoH, floorMat)
  wall1.position.set(0, wallHeight / 2, -floorSize / 2 - wallThickness / 2)
  wall1.receiveShadow = true
  worldGroup.add(wall1)

  const wall2 = new THREE.Mesh(wallGeoH, floorMat)
  wall2.position.set(0, wallHeight / 2, floorSize / 2 + wallThickness / 2)
  wall2.receiveShadow = true
  worldGroup.add(wall2)

  const wall3 = new THREE.Mesh(wallGeoV, floorMat)
  wall3.position.set(-14 / 2 - wallThickness / 2, wallHeight / 2, 0)
  wall3.receiveShadow = true
  worldGroup.add(wall3)

  const wall4 = new THREE.Mesh(wallGeoV, floorMat)
  wall4.position.set(14 / 2 + wallThickness / 2, wallHeight / 2, 0)
  wall4.receiveShadow = true
  worldGroup.add(wall4)
}

// Create bedding texture
function createBeddingTexture(): THREE.CanvasTexture {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base color
  ctx.fillStyle = '#fdfbf7'
  ctx.fillRect(0, 0, size, size)

  // Add bedding pieces
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 15 + Math.random() * 25
    const h = 15 + Math.random() * 25
    const rotation = Math.random() * Math.PI
    const val = 230 + Math.floor(Math.random() * 25)

    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.moveTo(-w / 2, -h / 2)
    ctx.lineTo(w / 2, -h / 2 + Math.random() * 5)
    ctx.lineTo(w / 2, h / 2)
    ctx.lineTo(-w / 2 + Math.random() * 5, h / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  return texture
}
</script>

<style>
.habitat-3d-debug__info {
  text-align: center;
  padding-block-end: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.habitat-3d-debug__canvas-wrapper {
  position: relative;
  inline-size: 100%;
  block-size: 70vh;
  background-color: #000;
  overflow: hidden;
}

.habitat-3d-debug__canvas-wrapper canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}
</style>
