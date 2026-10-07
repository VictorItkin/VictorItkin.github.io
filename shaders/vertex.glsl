attribute vec4 aVertexPosition;
uniform mat4 uModelView;
uniform mat4 uProjection;
void main() {
    gl_Position = uProjection * uModelView * aVertexPosition;
}
