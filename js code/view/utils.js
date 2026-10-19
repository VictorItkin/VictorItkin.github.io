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

function makeBoxLines(min, max) {
    const x0 = min[0], y0 = min[1], z0 = min[2];
    const x1 = max[0], y1 = max[1], z1 = max[2];
  
    // 8 вершин
    const v = [
      [x0, y0, z0], [x1, y0, z0],
      [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1],
      [x1, y1, z1], [x0, y1, z1]
    ];
  
    // 12 рёбер как пары индексов
    const edges = [
      0,1, 1,2, 2,3, 3,0,   // низ
      4,5, 5,6, 6,7, 7,4,   // верх
      0,4, 1,5, 2,6, 3,7    // бока
    ];
  
    const positions = [];
    for (const e of edges) {
      for (let i = 0; i < 3; i++) {
        positions.push(v[e][i]);
      }
    }
  
    return new Float32Array(positions);
  }
  
export {loadShaderSource, createShader, makeBoxLines};
