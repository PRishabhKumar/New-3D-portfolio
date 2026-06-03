uniform float uTime;
uniform float uProgress;
attribute float size;

varying float vAlpha;

void main() {
  vec3 pos = position * (1.0 + uProgress * 15.0);
  
  float angle = uTime * 0.5 + pos.z * 0.1;
  float s = sin(angle);
  float c = cos(angle);
  float tempX = pos.x;
  pos.x = tempX * c - pos.y * s;
  pos.y = tempX * s + pos.y * c;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  gl_PointSize = size * (100.0 / -mvPosition.z);
  vAlpha = 1.0 - pow(uProgress, 2.0);
}
