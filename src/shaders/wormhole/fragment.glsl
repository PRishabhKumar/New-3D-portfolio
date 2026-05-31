uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = -1.0 + 2.0 * uv;
  p.x *= uResolution.x / uResolution.y;
  
  vec2 m = uMouse / uResolution.xy;
  m = -1.0 + 2.0 * m;
  m.x *= uResolution.x / uResolution.y;
  
  vec2 center = vec2(0.0) + m * 0.1;
  vec2 d = p - center;
  
  float r = length(d);
  float a = atan(d.y, d.x);
  
  float tunnel = 1.0 / r + uTime * 0.5;
  vec2 finalUv = vec2(tunnel, a / 3.14159);
  
  float c = sin(finalUv.x * 10.0) * cos(finalUv.y * 10.0);
  
  vec3 color = mix(vec3(0.13, 0.83, 0.93), vec3(0.42, 0.28, 1.0), r);
  
  float vignette = smoothstep(0.0, 0.5, r);
  
  gl_FragColor = vec4(color * c * vignette, 1.0);
}
