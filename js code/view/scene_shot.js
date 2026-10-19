import {mat4_rotateX, mat4_rotateY, mat4_multiply, mat4_translate, mat4_perspective} from "./matrix.js"
import {makeBoxLines} from "./utils.js"

class CameraState{
    angleX = -80; // наклон вверх/вниз
    angleY = -30; // поворот влево/вправо
    shift = -2.5; // сдвиг назад
    lastX = 0;
    lastY = 0;
    isDragging = false;

    aspect; // Соотношение ширины и высоты области рисунка
    modelView; // Матрица проеобразования координат
    projection; // Проекция на плоский экран

    constructor(canvas){
        this.aspect = canvas.width / canvas.height;
        this.recalculateView();

        canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
        });

        canvas.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;
    
            const dx = event.clientX - this.lastX;
            const dy = event.clientY - this.lastY;
    
            // Чувствительность
            const sensitivity = 0.5; 
    
            // Вращение по горизонтали (вокруг Y)
            this.angleY += dx * sensitivity;
            // Вращение по вертикали (вокруг X)
            this.angleX += dy * sensitivity;
    
            this.lastX = event.clientX;
            this.lastY = event.clientY;

            this.recalculateView();
        });
        
        canvas.addEventListener('mouseup', () => {this.isDragging = false;});
    }
    recalculateView(){
        // Сначала поворот камеры: опускаем взгляд вниз и чуть поворачиваем голову вправо
        const rotX = mat4_rotateX(this.angleX * Math.PI / 180); 
        const rotY = mat4_rotateY(this.angleY * Math.PI / 180); 
        const rotate = mat4_multiply(rotY, rotX);
    
        // Потом сдвиг: уводим камеру назад, вправо и вверх
        // После поворота оси уже повернуты, поэтому сдвиг работает как «отойти назад от объекта»
        const translate = mat4_translate(0, 0, this.shift); 
    
        // Итоговая матрица: сначала поворот, потом сдвиг
        this.modelView = mat4_multiply(translate, rotate);
    
        // Перспектива для проекции
        this.projection = mat4_perspective(15 * Math.PI/180, this.aspect, 0.1, 10.0);
    }
}

export class SceneShot{
    cameraState;

    vertexBuffer;
    connectionBuffer;
    boxBuffer;

    constructor(textileModel, settings, gl){
        // Положение камеры
        this.cameraState = new CameraState(gl.canvas);
        // Вершины сетки
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textileModel.vertices), gl.STATIC_DRAW);
        // Связи между вершинами
        this.connectionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.connectionBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(textileModel.connections), gl.STATIC_DRAW);
        // Каркас для создания 3d-эффекта
        this.boxBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, makeBoxLines(settings.minBoxPoint, settings.maxBoxPoint), gl.STATIC_DRAW);
    }

    render(textileModel, gl, program, settings) {
        // Обновляем буфер данными
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textileModel.vertices, gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.connectionBuffer);
      
        // Настраиваем атрибуты (stride = 3*4, т.к. только позиции)
        const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 3 * 4, 0);
      
        // Матрицы (ракурс камеры)
        const uModelView = gl.getUniformLocation(program, 'uModelView');
        const uProjection = gl.getUniformLocation(program, 'uProjection');
    
        gl.useProgram(program)
        gl.uniformMatrix4fv(uModelView, false, this.cameraState.modelView);
        gl.uniformMatrix4fv(uProjection, false, this.cameraState.projection);
    
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); // чтобы ближние рёбра перекрывали дальние
    
        const uZMinLoc = gl.getUniformLocation(program, 'uZMin');
        const uZMaxLoc = gl.getUniformLocation(program, 'uZMax');
        const uIsBlack = gl.getUniformLocation(program, 'uIsBlack');
    
        gl.uniform1i(uIsBlack, 0); 
        gl.drawElements(gl.LINES, textileModel.connections.length, gl.UNSIGNED_SHORT, 0);
    
        // Каркас для 3d-эффекта
        gl.uniform1f(uZMinLoc, -settings.Z);
        gl.uniform1f(uZMaxLoc, settings.Z);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxBuffer);
        gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPosition);
      
        // Рисуем линиями: 12 рёбер = 24 вершины
        gl.uniform1i(uIsBlack, 1); 
        gl.drawArrays(gl.LINES, 0, 24);
    }
}