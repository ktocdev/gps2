import * as THREE from 'three'

export interface GuineaPigColors {
  fur: number
  ear: number
  skin: number
  eye: number
}

export function createGuineaPigModel(colors?: Partial<GuineaPigColors>): THREE.Group {
  // Default colors
  const furColor = colors?.fur ?? 0xe8cd9a
  const earColor = colors?.ear ?? 0x3b2918
  const skinColor = colors?.skin ?? 0xffdcd6
  const eyeColor = colors?.eye ?? 0x111111

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
  }

  return guineaPig
}
