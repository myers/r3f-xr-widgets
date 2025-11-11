import { LinearFilter, MeshBasicMaterial, SRGBColorSpace, TextureLoader } from 'three'
import { cursorTextureUrl } from 'r3f-xr-widgets'

/**
 * Custom cursor material for VR controllers in the HorizonWindow demo.
 * Configured with optimal settings for VR sharpness (no mipmaps, linear filtering).
 */
export class HorizonCursorMaterial extends MeshBasicMaterial {
  constructor() {
    super({
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      alphaTest: 0.01
    })

    // Load texture with optimal settings for VR sharpness
    const loader = new TextureLoader()
    this.map = loader.load(cursorTextureUrl)
    this.map.minFilter = LinearFilter      // No mipmaps = sharper!
    this.map.magFilter = LinearFilter
    this.map.generateMipmaps = false
    this.map.colorSpace = SRGBColorSpace
  }
}
