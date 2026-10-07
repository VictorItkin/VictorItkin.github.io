attribute vec3 aVertexPosition;

uniform mat4 uModelView;
uniform mat4 uProjection;
uniform float uZMin;
uniform float uZMax;

varying vec3 vColor;

vec3 jet(float t) {
    // Классическая аппроксимация jet: синий → голубой → зелёный → жёлтый → красный
    float r = clamp(1.5 - abs(4.0 * t - 3.0), 0.0, 1.0);
    float g = clamp(1.5 - abs(4.0 * t - 2.0), 0.0, 1.0);
    float b = clamp(1.5 - abs(4.0 * t - 1.0), 0.0, 1.0);
    return vec3(r, g, b);
}

void main(void) {
    gl_Position = uProjection * uModelView * vec4(aVertexPosition, 1.0);

    float t = (aVertexPosition.z - uZMin) / (uZMax - uZMin);
    t = clamp(t, 0.0, 1.0);

    vColor = jet(t);
}
