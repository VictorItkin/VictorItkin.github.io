import { pointIndexInVertices } from "./view/matrix.js"
export class Grid{
    M; // Количество точек по x
    K; // Количество точек по y
    dx; // Шаг по x
    dy; // Шаг по y
    dt; // Шаг по t
    center_idx; // Индекс центра
    corners_idx; // Индексы углов
    
    constructor(settings){
        const X = settings.X;
        const Y = settings.Y;
        
        const M = parseInt(document.getElementById('grid-width-M').value, 10); // размерность сетки по x
        const K = parseInt(document.getElementById('grid-height-K').value, 10); // размерность сетки по y
    
        if (isNaN(M) || isNaN(K) || M < 3 || K < 3) {
            alert('Пожалуйста, введите целые числа >= 3');
            return;
        }

        this.M = M;
        this.K = K;

        this.dx = X/(M-1);
        this.dy = Y/(K-1);
        this.dt = 1/Math.sqrt(settings.T/settings.rho)/Math.sqrt(1/this.dx**2 + 1/this.dy**2); // из условия устойчивости
    }
    setConstraintsIndices(vertices, settings){
        this.center_idx = pointIndexInVertices(vertices, settings.center)
        if (this.center_idx == -1)
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
        this.corners_idx = corners_idx;
    }
}
