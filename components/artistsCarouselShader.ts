export const artistsCarouselVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const artistsCarouselFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uWave;
  uniform float uFocus;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    if (!gl_FrontFacing) {
      uv.x = 1.0 - uv.x;
    }
    float waveX = sin(uv.y * 18.0 + uTime * 1.4) * 0.009;
    float waveY = cos(uv.x * 14.0 - uTime * 1.1) * 0.006;
    uv += vec2(waveX, waveY) * uWave;

    vec4 color = texture2D(uTexture, uv);
    color.rgb *= uFocus;
    gl_FragColor = color;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
