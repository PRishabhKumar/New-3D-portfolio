uniform float uTime;
uniform float uMorphStrength;
uniform vec2 uMouse;

attribute vec3 originalPosition;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normal;
  
  vec3 pos = originalPosition;
  
  // Per-vertex noise displacement
  float noise = sin(pos.x * 2.0 + uTime * 0.8) * 
                cos(pos.y * 1.5 + uTime * 0.6) * 
                sin(pos.z * 1.8 + uTime * 0.7);
  
  // Outward displacement along vertex normal
  pos += normal * noise * uMorphStrength * 0.35;
  
  // Mouse influence
  pos.x += uMouse.x * 0.15;
  pos.y += uMouse.y * 0.15;
  
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
