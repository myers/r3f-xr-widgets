import { ShaderMaterial, Vector3, Color } from 'three'

// Arc shader - vertex shader
export const arcVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`

// Arc shader - fragment shader (UV-space, no proximity fade)
export const arcFragmentShader = /* glsl */ `
uniform vec3 uLineColor;
uniform float uArcRadiusFraction;     // Arc radius as fraction of mesh size (e.g., 0.208 = 20.8%)
uniform float uLineThicknessFraction; // Line thickness as fraction of mesh size (e.g., 0.042 = 4.2%)
uniform float uOpacity;               // Simple opacity control

varying vec2 vUv;

void main() {
  // Work entirely in UV space (0-1 range)
  // Center at bottom-left corner (UV 0, 0)
  vec2 cornerUV = vUv - vec2(0.0, 0.0);

  // Distance from corner in UV space
  float uvDist = length(cornerUV);

  // Arc shape parameters in UV space
  float lineCenter = uArcRadiusFraction;
  float lineHalfWidth = uLineThicknessFraction * 0.5;
  float distFromLineCenter = abs(uvDist - lineCenter);

  // Check if we're in the bottom-right quadrant (for corner arc)
  bool inQuadrant = cornerUV.x >= 0.0 && cornerUV.y >= 0.0;

  // Calculate angle from corner (0° = right, 90° = up)
  float angle = atan(cornerUV.y, cornerUV.x);

  // Full 90-degree arc
  float arcStartAngle = 0.0;
  float arcEndAngle = 1.5708; // 90 degrees in radians
  bool inArcRange = angle >= arcStartAngle && angle <= arcEndAngle;

  // Arc body with smooth edges
  float lineAlpha = smoothstep(lineHalfWidth + 0.001, lineHalfWidth - 0.001, distFromLineCenter);

  // Rounded caps at arc endpoints
  vec2 capStart = vec2(cos(arcStartAngle), sin(arcStartAngle)) * lineCenter;
  vec2 capEnd = vec2(cos(arcEndAngle), sin(arcEndAngle)) * lineCenter;

  float distToCapStart = length(cornerUV - capStart);
  float distToCapEnd = length(cornerUV - capEnd);

  float capStartAlpha = smoothstep(lineHalfWidth + 0.001, lineHalfWidth - 0.001, distToCapStart);
  float capEndAlpha = smoothstep(lineHalfWidth + 0.001, lineHalfWidth - 0.001, distToCapEnd);

  // Combine arc body and caps
  float arcAlpha = lineAlpha * float(inQuadrant && inArcRange);
  arcAlpha = max(arcAlpha, max(capStartAlpha, capEndAlpha));

  // Apply simple opacity (no proximity fade)
  float finalOpacity = arcAlpha * uOpacity;

  gl_FragColor = vec4(uLineColor, finalOpacity);
}
`

export class ArcMaterial extends ShaderMaterial {
  declare color: Color

  constructor(
    arcRadiusFraction: number = 0.208,    // 2.5cm / 12cm = 20.8% for alignment with edge
    lineThicknessFraction: number = 0.042, // 0.5cm / 12cm = 4.2% to match edge thickness
    lineColor: Vector3 = new Vector3(1, 1, 1),
    opacity: number = 1.0
  ) {
    super({
      vertexShader: arcVertexShader,
      fragmentShader: arcFragmentShader,
      transparent: true,
      uniforms: {
        uLineColor: { value: lineColor },
        uArcRadiusFraction: { value: arcRadiusFraction },
        uLineThicknessFraction: { value: lineThicknessFraction },
        uOpacity: { value: opacity }
      }
    })

    console.log('[ArcMaterial] Constructor called with:', {
      arcRadiusFraction,
      lineThicknessFraction,
      lineColor,
      opacity
    })

    // Initialize color property for UIKit compatibility
    this.color = new Color(lineColor.x, lineColor.y, lineColor.z)

    // Check for shader compilation errors
    this.onBeforeCompile = () => {
      console.log('[ArcMaterial] Shader compiled successfully')
    }
  }

  onBeforeRender() {
    // Sync material.color changes to shader uniform
    this.uniforms.uLineColor.value.set(this.color.r, this.color.g, this.color.b)
  }

  // Helper to set opacity
  setOpacity(opacity: number) {
    this.uniforms.uOpacity.value = opacity
  }

  // Helper to match edge dimensions
  static fromEdgeDimensions(
    edgePosition: number,    // Distance from corner in meters
    edgeThickness: number,   // Line thickness in meters
    meshSize: number,        // Mesh dimension in meters
    lineColor: Vector3 = new Vector3(1, 1, 1),
    opacity: number = 1.0
  ): ArcMaterial {
    const arcRadiusFraction = edgePosition / meshSize
    const lineThicknessFraction = edgeThickness / meshSize
    return new ArcMaterial(arcRadiusFraction, lineThicknessFraction, lineColor, opacity)
  }
}