uniform vec3 uColor;
varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  float strength = (0.5 - dist) * 2.0;
  gl_FragColor = vec4(uColor, strength * vAlpha);
}
