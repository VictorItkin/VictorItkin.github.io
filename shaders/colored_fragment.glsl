precision mediump float;

varying vec3 vColor;
uniform int uIsBlack;

void main(void) {
    if (uIsBlack == 1) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    gl_FragColor = vec4(vColor, 1.0);
}
