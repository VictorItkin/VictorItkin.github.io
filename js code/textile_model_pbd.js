import { TextileModel } from "./textile_model.js"
import { fillArray } from "./view/matrix.js"; 

export class TextileModelPBD extends TextileModel{
    weights;

    constructor(settings, grid){
        super(settings, grid);
        this.weights = getWeights(settings, grid);        
    }
    
    correctPositioins(vertices, settings, grid){
        const connections3 = this.connections3;

        const dx = grid.dx;
        const dy = grid.dy;
        const dl = Math.sqrt(dx**2 + dy**2);
        const maxNumOfIterations = settings.maxNumOfIterations;
        const tolerance = settings.tolerance;
    
        const baseVertices = [...vertices];
        for (let i = 0; i < maxNumOfIterations; i++){
            this.correctPositioinsBase(vertices, connections3.x, dx);
            this.correctPositioinsBase(vertices, connections3.y, dy);
            this.correctPositioinsBase(vertices, connections3.diag, dl);
            
            const delta = arrayDistance(vertices, baseVertices);
            for (let j = 0; j < vertices.length; j++)
                baseVertices[j] = vertices[j];
    
            if (delta < tolerance)
                break
        }
    }
    correctPositioinsBase(vertices, connections, distance){
        const weights = this.weights;
        for (let i = 0; i < connections.length; i += 2){
            const idx_a = connections[i];
            const idx_b = connections[i + 1];
        
            const weight_a = weights[idx_a];
            const weight_b = weights[idx_b];
            const weight = weight_a + weight_b + 1e-14;
      
            const idx3_a = 3*idx_a;
            const idx3_b = 3*idx_b;
            const old_dx = vertices[idx3_a + 0] - vertices[idx3_b + 0];
            const old_dy = vertices[idx3_a + 1] - vertices[idx3_b + 1];
            const old_dz = vertices[idx3_a + 2] - vertices[idx3_b + 2];
                
            const oldDistance = Math.sqrt(old_dx**2 + old_dy**2 + old_dz**2);
            const factor = (oldDistance - distance)/oldDistance/weight;
    
            const new_dx = old_dx*factor;
            const new_dy = old_dy*factor;
            const new_dz = old_dz*factor;
            
            vertices[idx3_a + 0] -= weight_a * new_dx;
            vertices[idx3_b + 0] += weight_b * new_dx; 
            vertices[idx3_a + 1] -= weight_a * new_dy;
            vertices[idx3_b + 1] += weight_b * new_dy;
            vertices[idx3_a + 2] -= weight_a * new_dz;
            vertices[idx3_b + 2] += weight_b * new_dz;
        }
    }    
    update(time, settings, grid){
        const center3_idx = 3*grid.center_idx;
        const corners_idx = grid.corners_idx;
        const corners = settings.corners;
    
        const dt = grid.dt;
        const shift = settings.useGravity ? settings.shift : 0;
    
        // Пересчёт скоростей и прогноза
        const vertices = this.vertices;
        const velosities = this.velosities;
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
        this.correctPositioins(forecasts, settings, grid);
        // Обновление скоростей и вершин
        for (let i = 0; i < velosities.length; i++){
            velosities[i] = (forecasts[i] - vertices[i])/dt;
            vertices[i] = forecasts[i];
        }
    }
}

function arrayDistance(a, b){
    if (a.length !== b.length)
        throw new Error("Массивы должны быть равной длины")
    
    let distance = 0.0;
    for (let i = 0; i < a.length; i++){
        distance = Math.max(distance, Math.abs(a[i] - b[i]));
    }
    return distance;
}
function getWeights(settings, grid){
    const I = grid.M*grid.K;
    const fixed_idx = [...[grid.center_idx], ...grid.corners_idx];
    const weights = fillArray(I, 1/settings.mass);
    
    for (let i = 0; i < fixed_idx.length; i++) 
        weights[fixed_idx[i]] = 0.0; 
        
    return weights;
}
