import { zeros } from "./view/matrix.js"
import { getConnections } from "./get_connections.js"

export class TextileModel{
    vertices;
    velosities;
    connections3;
    connections;

    constructor(settings, grid){
        this.vertices = getInitialVertices(settings, grid);

        this.velosities = zeros(this.vertices.length);
        this.velosities[3*settings.center_idx + 2] = settings.f(0.0);

        this.connections3 = getConnections(grid.M, grid.K);
        this.connections = [...this.connections3.x, ...this.connections3.y, ...this.connections3.diag];
        
        grid.setConstraintsIndices(this.vertices, settings);
    }

    update(){
        throw new Error('Абстрактный метод update() не определён.');
    }
}

function getInitialVertices(settings, grid){
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
