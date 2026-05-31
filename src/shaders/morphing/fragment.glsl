varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = dot(viewDirection, vNormal);
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  fresnel = pow(fresnel, 3.0);
  
  vec3 edgeColor = vec3(0.424, 0.278, 1.0); // #6C47FF
  vec3 glowColor = vec3(0.659, 0.333, 0.969); // #A855F7
  
  vec3 finalColor = mix(edgeColor, glowColor, fresnel);
  
  gl_FragColor = vec4(finalColor, 0.65 + fresnel * 0.35);
}
