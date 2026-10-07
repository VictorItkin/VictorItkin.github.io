async function loadShaderSource(path) {
    const response = await fetch(path);
    if (!response.ok)
        throw new Error(`Не удалось загрузить ${path}`);

    return await response.text();
  }

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader); return null;
    }
    return shader;
}

export {loadShaderSource, createShader};
