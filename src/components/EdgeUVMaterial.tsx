import { ShaderMaterial, Vector3, Color, UniformsUtils } from 'three'

// UV-space edge shader - vertex shader
export const edgeUVVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

// UV-space edge shader - fragment shader (UV space with proximity fade)
export const edgeUVFragmentShader = /* glsl */ `
uniform vec3 uLineColor;
uniform float uLineThicknessFraction; // Line thickness as fraction of mesh size
uniform float uOpacity;
uniform vec3 uPointerPosition;
uniform float uRadius;
uniform bool uUseProximity;
uniform bool uForceVisible;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  // Work entirely in UV space (0-1 range)
  // Center at UV 0.5, 0.5
  vec2 centeredUV = vUv - vec2(0.5, 0.5);

  // Horizontal line at center (Y = 0)
  float lineHalfWidth = uLineThicknessFraction * 0.5;
  float distFromCenter = abs(centeredUV.y);

  // Smooth line body
  float lineAlpha = smoothstep(lineHalfWidth + 0.002, lineHalfWidth - 0.002, distFromCenter);

  // Rounded caps at line endpoints (left and right edges)
  float leftCapX = -0.5;
  float rightCapX = 0.5;

  vec2 leftCap = vec2(leftCapX, 0.0);
  vec2 rightCap = vec2(rightCapX, 0.0);

  float distToLeftCap = length(centeredUV - leftCap);
  float distToRightCap = length(centeredUV - rightCap);

  float leftCapAlpha = smoothstep(lineHalfWidth + 0.002, lineHalfWidth - 0.002, distToLeftCap);
  float rightCapAlpha = smoothstep(lineHalfWidth + 0.002, lineHalfWidth - 0.002, distToRightCap);

  // Combine line body and caps
  float alpha = lineAlpha;
  alpha = max(alpha, leftCapAlpha);
  alpha = max(alpha, rightCapAlpha);

  // Calculate proximity fade with steeper falloff
  float fadeFactor;
  if (uForceVisible) {
    fadeFactor = 1.0; // Force fully visible, override proximity
  } else if (uUseProximity) {
    float dist = distance(vWorldPosition, uPointerPosition);
    fadeFactor = smoothstep(uRadius, 0.0, dist);
    fadeFactor = fadeFactor * fadeFactor; // Square for steeper falloff
  } else {
    fadeFactor = 1.0; // Always visible
  }

  // Apply opacity and proximity fade
  float finalOpacity = alpha * uOpacity * fadeFactor;

  gl_FragColor = vec4(uLineColor, finalOpacity);
}
`

// Shared uniform template for optimal shader program caching
const defaultUniforms = {
  uLineColor: { value: new Vector3(1, 1, 1) },
  uLineThicknessFraction: { value: 0.083 },
  uOpacity: { value: 1.0 },
  uPointerPosition: { value: new Vector3(0, 0, 0) },
  uRadius: { value: 0.5 },
  uUseProximity: { value: true },
  uForceVisible: { value: false }
}

export class EdgeUVMaterial extends ShaderMaterial {
  declare color: Color

  constructor(
    lineThicknessFraction: number = 0.1, // 10% of mesh height as thickness
    lineColor: Vector3 = new Vector3(1, 1, 1),
    opacity: number = 1.0,
    useProximity: boolean = false,
    fadeRadius: number = 0.3
  ) {
    // Clone shared uniforms for this instance
    const uniforms = UniformsUtils.clone(defaultUniforms)

    // Set instance-specific values
    uniforms.uLineColor.value = lineColor
    uniforms.uLineThicknessFraction.value = lineThicknessFraction
    uniforms.uOpacity.value = opacity
    uniforms.uRadius.value = fadeRadius
    uniforms.uUseProximity.value = useProximity

    super({
      vertexShader: edgeUVVertexShader,
      fragmentShader: edgeUVFragmentShader,
      transparent: true,
      uniforms
    })

    console.log('[EdgeUVMaterial] Constructor called with:', {
      lineThicknessFraction,
      lineColor,
      opacity
    })

    // Initialize color property for UIKit compatibility
    this.color = new Color(lineColor.x, lineColor.y, lineColor.z)
  }

  onBeforeRender() {
    // Sync material.color changes to shader uniform
    this.uniforms.uLineColor.value.set(this.color.r, this.color.g, this.color.b)
  }

  // Helper to set opacity
  setOpacity(opacity: number) {
    this.uniforms.uOpacity.value = opacity
  }

  // Helper to force visibility (override proximity fade)
  setForceVisible(visible: boolean) {
    this.uniforms.uForceVisible.value = visible
  }
}