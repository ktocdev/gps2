import type { Ref } from 'vue'
import * as THREE from 'three'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Light Sky Blue
  scene.fog = new THREE.Fog(0x87CEEB, 40, 120) // Matching fog (scaled for larger scene)

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45, // FOV
    1, // Aspect - will be set in initRenderer
    0.1, // Near
    1000, // Far
  )
  camera.position.set(10, 15, 30)
  camera.lookAt(0, 0, 0)

  // Renderer
  let renderer: THREE.WebGLRenderer | null = null

  // World Group (for rotation)
  const worldGroup = new THREE.Group()
  scene.add(worldGroup)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(15, 30, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  dirLight.shadow.camera.left = -30
  dirLight.shadow.camera.right = 30
  dirLight.shadow.camera.top = 30
  dirLight.shadow.camera.bottom = -30
  scene.add(dirLight)

  const backLight = new THREE.DirectionalLight(0xccccff, 0.4)
  backLight.position.set(-15, 15, -15)
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
