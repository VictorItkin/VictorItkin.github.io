// --- Простые матрицы (для примера, без библиотек) ---
function mat4_identity() {
    return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);
}
function mat4_translate(tx, ty, tz) {
    const m = mat4_identity();
    m[12] = tx; m[13] = ty; m[14] = tz;
    return m;
}
function mat4_perspective(fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    const rangeInv = 1 / (near - far);
    return new Float32Array([
        f / aspect, 0,                 0,                       0,
        0,          f,                 0,                       0,
        0,          0,                 (near + far) * rangeInv, -1,
        0,          0,                 near * far * rangeInv,   0
    ]);
}
function mat4_ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    return new Float32Array([
    -2 * lr, 0,      0,     0,
    0,     -2 * bt, 0,     0,
    0,     0,      2 * nf, 0,
    (left + right) * lr,
    (bottom + top) * bt,
    (near + far) * nf,
    1
    ]);
}
function mat4_rotateX(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = mat4_identity();
    m[5] = c;  m[6] = s;
    m[9] = -s; m[10] = c;
    return m;
}
function mat4_rotateY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = mat4_identity();
    m[0] = c;  m[2] = -s;
    m[8] = s;  m[10] = c;
    return m;
}
function mat4_multiply(a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
            sum += a[i + 4 * k] * b[k + 4 * j];
            }
            r[i + 4 * j] = sum;
        }
    }
    return r;
}
function pointIndexInVertices(vertices, point, epsilon = 1e-6) {
    const length = vertices.length;
    if (length % 3 !== 0) {
      throw new Error('Некорректный массив вершин: длина не кратна 3');
    }
  
    for (let i = 0; i < length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
  
      if (Math.abs(x - point[0]) < epsilon &&
          Math.abs(y - point[1]) < epsilon &&
          Math.abs(z - point[2]) < epsilon) {
        return i/3; // нашли
      }
    }
    return -1; // не нашли
}
function fillArray(length, value = 0.0){
    const result = new Float32Array(length);
    for (let i = 0; i < length; i++)
        result[i] = value;

    return result;
}
function zeros3(length){
    return fillArray(3*length);
}

export {mat4_rotateX, mat4_rotateY, mat4_multiply, mat4_translate, mat4_perspective,
    pointIndexInVertices, fillArray, zeros3};
