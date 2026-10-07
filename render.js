import {mat4_rotateX, mat4_rotateY, mat4_multiply, mat4_translate, mat4_perspective} from "./matrix.js"

function getBuffers(vertices, connections, gl){
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const connectionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, connectionBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(connections), gl.STATIC_DRAW);

    return vertexBuffer;
}

function render(vertices, connections, gl, vertexBuffer, program, settings) {
    // Обновляем буфер данными, которые пришли в аргументе
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  
    // Настраиваем атрибуты (stride = 3*4, т.к. только позиции)
    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 3 * 4, 0);
  
    // Матрицы (ракурс камеры)
    const uModelView = gl.getUniformLocation(program, 'uModelView');
    const uProjection = gl.getUniformLocation(program, 'uProjection');

    // Сначала поворот камеры: опускаем взгляд вниз и чуть поворачиваем голову вправо
    const rotX = mat4_rotateX(-80 * Math.PI / 180); //-80
    const rotY = mat4_rotateY(-30 * Math.PI / 180); //-30
    const rotate = mat4_multiply(rotY, rotX);

    // Потом сдвиг: уводим камеру назад, вправо и вверх
    // После поворота оси уже повернуты, поэтому сдвиг работает как «отойти назад от объекта»
    const translate = mat4_translate(0, 0, -2.5); 

    // Итоговая матрица: сначала поворот, потом сдвиг
    const modelView = mat4_multiply(translate, rotate);

    const aspect = gl.canvas.width / gl.canvas.height;
    // Перспектива обязательна для такого ракурса
    const projection = mat4_perspective(15 * Math.PI/180, aspect, 0.1, 10.0);
    
    gl.useProgram(program)
    gl.uniformMatrix4fv(uModelView, false, modelView);
    gl.uniformMatrix4fv(uProjection, false, projection);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // чтобы ближние рёбра перекрывали дальние

    const uZMinLoc = gl.getUniformLocation(program, 'uZMin');
    const uZMaxLoc = gl.getUniformLocation(program, 'uZMax');

    gl.uniform1f(uZMinLoc, -settings.a);
    gl.uniform1f(uZMaxLoc, settings.a);

    gl.drawElements(gl.LINES, connections.length, gl.UNSIGNED_SHORT, 0);
}

export {getBuffers, render};
