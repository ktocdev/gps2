import * as THREE from 'three'

/**
 * Create a cucumber slice for food display in bowls
 */
export function createCucumberSlice(): THREE.Group {
  const group = new THREE.Group()

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x1b5e20, // Dark green
    roughness: 0.3,
  })
  const fleshMat = new THREE.MeshStandardMaterial({
    color: 0xDFF7DF, // Light mint green
    roughness: 0.5,
    side: THREE.DoubleSide,
  })

  // Half-cylinder (radius 0.5 → 1.0, thick 0.1 → 0.2, scaled 2x)
  const sliceGeo = new THREE.CylinderGeometry(
    1.0, // radius
    1.0, // radius
    0.2, // thickness
    32,  // segments
    1,   // height segments
    false, // open ended
    0,   // theta start
    Math.PI // theta length (half circle)
  )

  const slice = new THREE.Mesh(sliceGeo, [skinMat, fleshMat, fleshMat])
  slice.castShadow = true
  group.add(slice)

  // Cut surface (flat face)
  const cutGeo = new THREE.BoxGeometry(2.0, 0.2, 0.04)
  const cut = new THREE.Mesh(cutGeo, fleshMat)
  cut.rotation.y = Math.PI / 2
  cut.position.set(-0.02, 0, 0)
  group.add(cut)

  return group
}
