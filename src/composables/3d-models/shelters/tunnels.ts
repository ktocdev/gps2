import * as THREE from 'three'
import { createWoodTexture } from '../shared/textures'

/**
 * Create wooden archway tunnel (purchasable item)
 */
export function createWoodenTunnelModel(): THREE.Group {
  const group = new THREE.Group()
  const woodTexture = createWoodTexture()

  // Create arch shape
  const tunnelShape = new THREE.Shape()
  const legHeight = 3.0 // Scaled 2x from 1.5

  // Outer arc
  tunnelShape.absarc(0, 0, 4.0, 0, Math.PI, false) // Scaled 2x from 2.0

  // Line down left side
  tunnelShape.lineTo(-4.0, -legHeight)

  // Line across bottom
  tunnelShape.lineTo(4.0, -legHeight)

  // Line up right side
  tunnelShape.lineTo(4.0, 0)

  // Inner arc (cut out)
  tunnelShape.absarc(0, 0, 3.2, Math.PI, 0, true) // Scaled 2x from 1.6

  // Extrude settings
  const extrudeSettings = {
    depth: 8.0, // Scaled 2x from 4.0
    bevelEnabled: true,
    bevelThickness: 0.1, // Scaled 2x from 0.05
    bevelSize: 0.1,      // Scaled 2x from 0.05
    bevelSegments: 2,
    curveSegments: 16,
    steps: 1,
  }

  const tunnelGeo = new THREE.ExtrudeGeometry(tunnelShape, extrudeSettings)

  // Wood materials (same as stick)
  const woodSideMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.1,
    roughness: 0.9,
  })
  const woodEndMat = new THREE.MeshStandardMaterial({
    color: 0xDEB887,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.05,
    roughness: 0.8,
  })

  const tunnel = new THREE.Mesh(tunnelGeo, [woodSideMat, woodEndMat])
  tunnel.position.y = 3.5 // Scaled 2x from 1.75
  tunnel.rotation.y = Math.PI / 2
  tunnel.castShadow = true
  tunnel.receiveShadow = true
  group.add(tunnel)

  return group
}
