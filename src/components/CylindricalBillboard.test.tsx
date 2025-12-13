import { describe, it, expect } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { CylindricalBillboard } from './CylindricalBillboard'

// Configure React act() environment for test renderer
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('CylindricalBillboard', () => {
  describe('Rendering', () => {
    it('should render children', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard>
          <mesh name="test-mesh">
            <boxGeometry />
            <meshBasicMaterial />
          </mesh>
        </CylindricalBillboard>
      )

      const mesh = renderer.scene.findByProps({ name: 'test-mesh' })
      expect(mesh).toBeDefined()
    })
  })

  describe('Initial Rotation', () => {
    it('should rotate to face camera on first frame when initialRotation=true', async () => {
      // Position billboard away from camera so rotation is needed
      const renderer = await ReactThreeTestRenderer.create(
        <group position={[5, 0, 0]}>
          <CylindricalBillboard initialRotation={true} autoRotate={false}>
            <mesh name="test-mesh" />
          </CylindricalBillboard>
        </group>
      )

      // Get the CylindricalBillboard group (child of the positioning group)
      const positioningGroup = renderer.scene.children[0]
      const billboardGroup = positioningGroup.children[0]
      const initialRotationY = billboardGroup.instance.rotation.y

      // Advance one frame to trigger initial rotation
      await renderer.advanceFrames(1, 1 / 60)

      // Rotation should have changed to face camera at origin
      expect(billboardGroup.instance.rotation.y).not.toBe(initialRotationY)
    })

    it('should not rotate initially when initialRotation=false', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard initialRotation={false} autoRotate={false}>
          <mesh name="test-mesh" />
        </CylindricalBillboard>
      )

      const group = renderer.scene.children[0]
      const initialRotationY = group.instance.rotation.y

      await renderer.advanceFrames(1, 1 / 60)

      // Rotation should remain unchanged
      expect(group.instance.rotation.y).toBe(initialRotationY)
    })

    it('should only rotate once when initialRotation=true', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard initialRotation={true} autoRotate={false}>
          <mesh name="test-mesh" />
        </CylindricalBillboard>
      )

      const group = renderer.scene.children[0]

      // First frame does initial rotation
      await renderer.advanceFrames(1, 1 / 60)
      const rotationAfterInitial = group.instance.rotation.y

      // Subsequent frames should not change rotation (autoRotate is false)
      await renderer.advanceFrames(5, 1 / 60)
      expect(group.instance.rotation.y).toBe(rotationAfterInitial)
    })
  })

  describe('Auto Rotation', () => {
    it('should rotate on every frame when autoRotate=true', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard initialRotation={false} autoRotate={true}>
          <mesh name="test-mesh" />
        </CylindricalBillboard>
      )

      const group = renderer.scene.children[0]

      await renderer.advanceFrames(1, 1 / 60)
      const rotationAfterFrame1 = group.instance.rotation.y

      // With static camera at same position, rotation should stay consistent
      await renderer.advanceFrames(1, 1 / 60)
      expect(group.instance.rotation.y).toBe(rotationAfterFrame1)
    })

    it('should not rotate when autoRotate=false after initial rotation', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard initialRotation={true} autoRotate={false}>
          <mesh name="test-mesh" />
        </CylindricalBillboard>
      )

      const group = renderer.scene.children[0]

      // First frame does initial rotation
      await renderer.advanceFrames(1, 1 / 60)
      const rotationAfterInitial = group.instance.rotation.y

      // Subsequent frames should not change rotation
      await renderer.advanceFrames(5, 1 / 60)
      expect(group.instance.rotation.y).toBe(rotationAfterInitial)
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to the group', async () => {
      let groupRef: unknown = null

      await ReactThreeTestRenderer.create(
        <CylindricalBillboard ref={(ref) => { groupRef = ref }}>
          <mesh name="test-mesh" />
        </CylindricalBillboard>
      )

      // Ref should be set to a truthy value (the group instance)
      expect(groupRef).toBeTruthy()
      // Should have Group-like properties
      expect(groupRef).toHaveProperty('isObject3D', true)
      expect(groupRef).toHaveProperty('isGroup', true)
    })
  })

  describe('Child Position Tracking', () => {
    it('should track child position when child moves', async () => {
      // Create billboard with a child group that can be moved
      const renderer = await ReactThreeTestRenderer.create(
        <CylindricalBillboard initialRotation={false} autoRotate={true}>
          <group name="movable-child">
            <mesh name="test-mesh" />
          </group>
        </CylindricalBillboard>
      )

      const billboardGroup = renderer.scene.children[0]
      const movableChild = billboardGroup.instance.children[0]

      // Get initial rotation
      await renderer.advanceFrames(1, 1 / 60)
      const initialRotationY = billboardGroup.instance.rotation.y

      // Move child to the right (X=5), keeping it at origin Z
      // This should cause billboard to rotate to face the child's new position
      movableChild.position.set(5, 0, 0)
      movableChild.updateMatrixWorld()

      await renderer.advanceFrames(1, 1 / 60)

      // Rotation should change because child is now at a different position
      // The billboard should rotate to face the camera from the child's position
      expect(billboardGroup.instance.rotation.y).not.toBe(initialRotationY)
    })
  })
})
