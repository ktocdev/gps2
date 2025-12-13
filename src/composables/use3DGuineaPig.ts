import * as THREE from 'three'
import { disposeObject3D } from '../utils/three-cleanup'
import { DEFAULT_GUINEA_PIG_COLORS, type GuineaPig3DColors } from '../constants/guineaPigColors'

// Re-export for convenience
export type { GuineaPig3DColors as GuineaPigColors }

export function createGuineaPigModel(colors?: Partial<GuineaPig3DColors>): THREE.Group {
  // Use provided colors or fall back to defaults
  const furColor = colors?.fur ?? DEFAULT_GUINEA_PIG_COLORS.fur
  const earColor = colors?.ear ?? DEFAULT_GUINEA_PIG_COLORS.ear
  const skinColor = colors?.skin ?? DEFAULT_GUINEA_PIG_COLORS.skin
  const eyeColor = colors?.eye ?? DEFAULT_GUINEA_PIG_COLORS.eye

  // Materials
  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.9,
    flatShading: false,
  })

  const earMat = new THREE.MeshStandardMaterial({
    color: earColor,
    roughness: 0.8,
  })

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.5,
  })

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: eyeColor,
    roughness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })

  const guineaPig = new THREE.Group()

  // Body
  const bodyGeo = new THREE.SphereGeometry(1, 32, 32)
  bodyGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.1, 1.0, 1.8))
  const body = new THREE.Mesh(bodyGeo, furMat)
  body.position.y = 1.0
  body.castShadow = true
  body.receiveShadow = true
  guineaPig.add(body)

  // Head
  const headGeo = new THREE.SphereGeometry(0.85, 32, 32)
  headGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.95, 1.2))
  const head = new THREE.Mesh(headGeo, furMat)
  head.position.set(0, 1.0, 1.3)
  head.castShadow = true
  guineaPig.add(head)

  // Ears
  const earGeo = new THREE.SphereGeometry(0.35, 32, 16)
  earGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 0.2))

  const leftEar = new THREE.Mesh(earGeo, earMat)
  leftEar.position.set(0.6, 1.5, 1.1)
  leftEar.rotation.set(0.5, -0.5, -0.5)
  leftEar.castShadow = true
  guineaPig.add(leftEar)

  const rightEar = new THREE.Mesh(earGeo, earMat)
  rightEar.position.set(-0.6, 1.5, 1.1)
  rightEar.rotation.set(0.5, 0.5, 0.5)
  rightEar.castShadow = true
  guineaPig.add(rightEar)

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 32, 32)

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
  leftEye.position.set(0.65, 1.2, 1.7)
  guineaPig.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
  rightEye.position.set(-0.65, 1.2, 1.7)
  guineaPig.add(rightEye)

  // Nose/Snout
  const noseGeo = new THREE.SphereGeometry(0.15, 16, 16)
  noseGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.6, 0.5))
  const nose = new THREE.Mesh(noseGeo, skinMat)
  nose.position.set(0, 0.9, 2.35)
  guineaPig.add(nose)

  // Mouth parts
  const mouthPartGeo = new THREE.SphereGeometry(0.1, 16, 16)

  const mouthLeft = new THREE.Mesh(mouthPartGeo, furMat)
  mouthLeft.position.set(0.1, 0.75, 2.25)
  guineaPig.add(mouthLeft)

  const mouthRight = new THREE.Mesh(mouthPartGeo, furMat)
  mouthRight.position.set(-0.1, 0.75, 2.25)
  guineaPig.add(mouthRight)

  // Feet
  const footGeo = new THREE.CapsuleGeometry(0.12, 0.3, 4, 8)
  footGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))

  const flFoot = new THREE.Mesh(footGeo, skinMat)
  flFoot.position.set(0.4, 0.1, 1.5)
  flFoot.castShadow = true
  guineaPig.add(flFoot)

  const frFoot = new THREE.Mesh(footGeo, skinMat)
  frFoot.position.set(-0.4, 0.1, 1.5)
  frFoot.castShadow = true
  guineaPig.add(frFoot)

  const blFoot = new THREE.Mesh(footGeo, skinMat)
  blFoot.position.set(0.5, 0.1, -0.8)
  blFoot.rotation.y = 0.5
  blFoot.castShadow = true
  guineaPig.add(blFoot)

  const brFoot = new THREE.Mesh(footGeo, skinMat)
  brFoot.position.set(-0.5, 0.1, -0.8)
  brFoot.rotation.y = -0.5
  brFoot.castShadow = true
  guineaPig.add(brFoot)

  // Store references for animations
  guineaPig.userData = {
    body,
    head,
    leftEye,
    rightEye,
    nose,
    feet: { flFoot, frFoot, blFoot, brFoot },
    // Animation state
    animation: {
      isBlinking: false,
      blinkEndTime: 0,
      nextBlinkTime: Date.now() + Math.random() * 3000 + 2000, // 2-5 seconds
      walkPhase: 0,
      isWalking: false,
      // Store original foot positions for animation
      footRestPositions: {
        fl: { y: flFoot.position.y, z: flFoot.position.z },
        fr: { y: frFoot.position.y, z: frFoot.position.z },
        bl: { y: blFoot.position.y, z: blFoot.position.z },
        br: { y: brFoot.position.y, z: brFoot.position.z },
      },
    },
  }

  return guineaPig
}

/**
 * Dispose a guinea pig model and all its resources
 */
export function disposeGuineaPigModel(model: THREE.Group): void {
  disposeObject3D(model)
}

// Animation constants
const BLINK_DURATION = 150 // ms
const BLINK_MIN_INTERVAL = 2000 // ms
const BLINK_MAX_INTERVAL = 6000 // ms
const WALK_SPEED = 12 // Animation speed multiplier
const FOOT_LIFT_HEIGHT = 0.08
const FOOT_STRIDE_LENGTH = 0.1

/**
 * Update guinea pig animations (call every frame)
 * @param model - The guinea pig THREE.Group
 * @param isMoving - Whether the guinea pig is currently walking
 * @param deltaTime - Time since last frame in seconds
 */
export function updateGuineaPigAnimation(
  model: THREE.Group,
  isMoving: boolean,
  deltaTime: number
): void {
  const { leftEye, rightEye, feet, animation } = model.userData
  if (!animation) return

  const now = Date.now()

  // === BLINKING ANIMATION ===
  if (animation.isBlinking) {
    // Currently blinking - check if blink should end
    if (now >= animation.blinkEndTime) {
      // End blink - restore eye scale
      leftEye.scale.y = 1
      rightEye.scale.y = 1
      animation.isBlinking = false
      // Schedule next blink
      animation.nextBlinkTime = now + BLINK_MIN_INTERVAL + Math.random() * (BLINK_MAX_INTERVAL - BLINK_MIN_INTERVAL)
    }
  } else {
    // Not blinking - check if it's time to blink
    if (now >= animation.nextBlinkTime) {
      // Start blink - squash eyes
      leftEye.scale.y = 0.1
      rightEye.scale.y = 0.1
      animation.isBlinking = true
      animation.blinkEndTime = now + BLINK_DURATION
    }
  }

  // === WALKING ANIMATION ===
  animation.isWalking = isMoving

  if (isMoving) {
    // Advance walk phase
    animation.walkPhase += deltaTime * WALK_SPEED

    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Diagonal pairs move together (like a trot)
    // Front-left and back-right are one pair
    // Front-right and back-left are the other pair
    const phase1 = Math.sin(animation.walkPhase)
    const phase2 = Math.sin(animation.walkPhase + Math.PI) // Opposite phase

    // Front-left foot
    flFoot.position.y = rest.fl.y + Math.max(0, phase1) * FOOT_LIFT_HEIGHT
    flFoot.position.z = rest.fl.z + phase1 * FOOT_STRIDE_LENGTH

    // Back-right foot (same phase as front-left)
    brFoot.position.y = rest.br.y + Math.max(0, phase1) * FOOT_LIFT_HEIGHT
    brFoot.position.z = rest.br.z + phase1 * FOOT_STRIDE_LENGTH

    // Front-right foot (opposite phase)
    frFoot.position.y = rest.fr.y + Math.max(0, phase2) * FOOT_LIFT_HEIGHT
    frFoot.position.z = rest.fr.z + phase2 * FOOT_STRIDE_LENGTH

    // Back-left foot (same phase as front-right)
    blFoot.position.y = rest.bl.y + Math.max(0, phase2) * FOOT_LIFT_HEIGHT
    blFoot.position.z = rest.bl.z + phase2 * FOOT_STRIDE_LENGTH
  } else {
    // Not walking - smoothly return feet to rest position
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions
    const returnSpeed = 5 * deltaTime

    flFoot.position.y += (rest.fl.y - flFoot.position.y) * returnSpeed
    flFoot.position.z += (rest.fl.z - flFoot.position.z) * returnSpeed
    frFoot.position.y += (rest.fr.y - frFoot.position.y) * returnSpeed
    frFoot.position.z += (rest.fr.z - frFoot.position.z) * returnSpeed
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed
  }
}
