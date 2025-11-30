import type { Ref } from 'vue'
import * as THREE from 'three'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Light Sky Blue
  scene.fog = new THREE.Fog(0x87CEEB, 20, 60) // Matching fog

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45, // FOV
    1, // Aspect - will be set in initRenderer
    0.1, // Near
    1000, // Far
  )
  camera.position.set(4, 3, 8)
  camera.lookAt(4, 0, 0)

  // Renderer
  let renderer: THREE.WebGLRenderer | null = null

  // World Group (for rotation)
  const worldGroup = new THREE.Group()
  scene.add(worldGroup)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 7)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  const backLight = new THREE.DirectionalLight(0xccccff, 0.4)
  backLight.position.set(-5, 5, -5)
  scene.add(backLight)

  // Initialize renderer
  function initRenderer() {
    if (!canvasRef.value) return null

    const canvas = canvasRef.value
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    })
    renderer.setSize(width, height, false)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true

    // Set camera aspect
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    return renderer
  }

  // Handle canvas resize
  function handleResize() {
    if (!renderer || !canvasRef.value) return

    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  // Cleanup
  function cleanup() {
    if (renderer) {
      renderer.dispose()
    }
  }

  return {
    scene,
    camera,
    worldGroup,
    initRenderer,
    handleResize,
    cleanup,
    getRenderer: () => renderer,
  }
}
