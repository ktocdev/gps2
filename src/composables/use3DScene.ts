import { onMounted, onUnmounted, type Ref } from 'vue'
import * as THREE from 'three'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Light Sky Blue
  scene.fog = new THREE.Fog(0x87CEEB, 20, 60) // Matching fog

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45, // FOV
    window.innerWidth / window.innerHeight, // Aspect
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
    if (!canvasRef.value) return

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true
  }

  // Handle window resize
  function handleResize() {
    if (!renderer) return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // Animation loop
  let animationId: number | null = null
  function animate() {
    animationId = requestAnimationFrame(animate)
    if (renderer) {
      renderer.render(scene, camera)
    }
  }

  // Lifecycle
  onMounted(() => {
    initRenderer()
    window.addEventListener('resize', handleResize)
    animate()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
    if (renderer) {
      renderer.dispose()
    }
  })

  return {
    scene,
    camera,
    renderer: () => renderer,
    worldGroup,
  }
}
