import {fillArray, pointIndexInVertices} from "./matrix.js"
import {correctPositioins} from "./correct_positioins.js"

function initSettings(){
    return {
        X: 0.8, // длина, м
        Y: 0.6, // ширина, м
        a: 0.3,
        b: 0.1, // параметры закона колебания
        rho: 1e-3, // кг/м
        g: 9.81, // м/с^2
        maxNumOfIterations: 300,
        tolerance: 1e-4,
    };
}
function initGrid(){
    return {
        M: 15, // размерность сетки по x
        K: 15, // размерность сетки по y
        dt: 0.2, // шаг по t
    }
}
function extSettings(settings, grid){ 
    const X = settings.X;
    const Y = settings.Y;

    settings.mass = settings.rho*grid.dx*grid.dy/2; // масса, сосредоточенная в узле 
    settings.shift = -grid.dt*settings.mass*settings.g;
    settings.center = [0.0, 0.0, 0.0];
    settings.corners = [-X/2, -Y/2, 0.0,
                        -X/2,  Y/2, 0.0,
                         X/2, -Y/2, 0.0,
                         X/2,  Y/2, 0.0];
    settings.F = t => settings.a*Math.sin(settings.b*t); // закон колебания этой точки
    settings.f = t => settings.a*settings.b*Math.cos(settings.b*t); // производная по t
}
function extGrid(settings, grid){
    const X = settings.X;
    const Y = settings.Y;

    const M = grid.M;
    const K = grid.K;

    grid.dx = X/(M-1);
    grid.dy = Y/(K-1);
}
function setConstraintsIndices(vertices, settings, grid){
    grid.center_idx = pointIndexInVertices(vertices, settings.center)
    if (grid.center_idx == -1)
        throw new Error("Точка колебания не попала на сетку.")

    const corners = settings.corners;
    const corners_idx = [];
    for (let i = 0; i < 3*4; i += 3){
        const corner = [corners[i + 0], corners[i + 1], corners[i + 2]];
        const corner_idx = pointIndexInVertices(vertices, corner);
        if (corner_idx == -1)
            throw new Error("Угол не попал на сетку.")
        else
            corners_idx.push(corner_idx);
    }
    grid.corners_idx = corners_idx;
}
function initVertices(settings, grid){
    // Начальные вершины 
    const left = -settings.X/2;
    const bottom  = -settings.Y/2;
    const M = grid.M;
    const K = grid.K;

    const dx = grid.dx;
    const dy = grid.dy;

    const vertices = new Float32Array(3*M*K);
    let i = 0;
    for (let m = 0; m < M; m++) {
        for (let k = 0; k < K; k++) {
            const x = left + m * dx;
            const y = bottom + k * dy;
            vertices[i + 0] = x;
            vertices[i + 1] = y;
            vertices[i + 2] = 0.0;
            i += 3;
        }
    }

    return vertices;
}
function initWeights(settings, grid){
    const I = grid.M*grid.K;
    const fixed_idx = [...[grid.center_idx], ...grid.corners_idx];
    const weights = fillArray(I, 1/settings.mass);
    
    for (let i = 0; i < fixed_idx.length; i++) 
        weights[fixed_idx[i]] = 0.0; 
        
    return weights
}
function updateVertices(time, velosities, vertices, connections, weights, settings, grid){
    const center3_idx = 3*grid.center_idx;
    const corners_idx = grid.corners_idx;
    const corners = settings.corners;

    const dt = grid.dt;

    const shift = settings.shift;

    // Пересчёт скоростей и прогноза
    const length = vertices.length;
    const forecasts =  new Float32Array(length);
    for (let i = 0; i < length - 2; i += 3) {
        velosities[i + 2] += shift;

        forecasts[i + 0] = vertices[i + 0] + velosities[i]*dt;
        forecasts[i + 1] = vertices[i + 1] + velosities[i + 1]*dt;
        forecasts[i + 2] = vertices[i + 2] + velosities[i + 2]*dt;
    }
    // Ограничения в центре
    forecasts[center3_idx + 0] = 0.0;
    forecasts[center3_idx + 1] = 0.0;
    forecasts[center3_idx + 2] = settings.F(time);

    // Ограничения по углам
    for (let i = 0; i < 4; i++){
        const idx3 = 3*corners_idx[i];
        const i3 = 3*i;

        forecasts[idx3 + 0] = corners[i3 + 0];
        forecasts[idx3 + 1] = corners[i3 + 1];
        forecasts[idx3 + 2] = corners[i3 + 2];
    }
    // Основная процедура коррекции положений вершин
    correctPositioins(forecasts, weights, connections, settings, grid);
    // Обновление скоростей и вершин
    for (let i = 0; i < velosities.length; i++)
        velosities[i] = (forecasts[i] - vertices[i])/dt;

    for (let j = 0; j < vertices.length; j++)
        vertices[j] = forecasts[j];
}

export {initSettings, initGrid, extGrid, extSettings, setConstraintsIndices, initVertices, initWeights, updateVertices};
