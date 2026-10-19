import { TextileModel } from "./textile_model.js"

export class TextileModelExplicit extends TextileModel{
    update(time, settings, grid){
        const vertices = this.vertices;
        const velosities = this.velosities;

        const center_idx = grid.center_idx;
    
        const M = grid.M;
        const K = grid.K;
        const dx = grid.dx;
        const dy = grid.dy;
        const dt = grid.dt;
    
        const v = settings.v;
        
        const rx = v*dt**2/dx**2;
        const ry = v*dt**2/dy**2;
        const G = settings.useGravity ? settings.g*dt**2 : 0.0;
    
        const getIndex = (m, k) => m*K + k;
    
        // Пересчёт скоростей и прогноза
        const length = vertices.length/3;
        const z = new Float32Array(length);
        for (let k = 1; k < K-1; k++){
            for (let m = 1; m < M-1; m++) {
                const i = getIndex(m, k); // точка в центре
                if (i !== center_idx){
                    const i3 = 3*i + 2; // соответствие z в одномерном массиве
                    const i3_left = 3*getIndex(m-1, k) + 2; // точка слева
                    const i3_right = 3*getIndex(m+1, k) + 2; // точка справа
                    const i3_down = 3*getIndex(m, k-1) + 2; // точка снизу
                    const i3_up = 3*getIndex(m, k+1) + 2; // точка сверху
    
                    // Разностная схема
                    z[i] = vertices[i3] + velosities[i3]*dt + 
                            rx*(vertices[i3_right] - 2*vertices[i3] + vertices[i3_left]) +
                            ry*(vertices[i3_up] - 2*vertices[i3] + vertices[i3_down]) - G;
                }
            }
        }
        
        // Ограничение на границах по x
        for (let k = 1; k < K-1; k++){
            z[getIndex(0, k)] = vertices[3*getIndex(1, k)+2];   // dz/dy(x = 0) = 0
            z[getIndex(M-1, k)] = vertices[3*getIndex(M-2, k)+2]; // dz/dy(x = X) = 0
    
            // z[getIndex(0, k)] = z[getIndex(1, k)];   // dz/dy(x = 0) = 0
            // z[getIndex(M-1, k)] = z[getIndex(M-2, k)]; // dz/dy(x = X) = 0
        }
        // Ограничение на границах по y
        for (let m = 1; m < M-1; m++){
            z[getIndex(m, 0)] = vertices[3*getIndex(m, 1)+2];  // dz/dy(x = 0) = 0
            z[getIndex(m, K-1)] = vertices[3*getIndex(m, K-2)+2]; // dz/dy(x = X) = 0
    
            // z[getIndex(m, 0)] = z[getIndex(m, 1)];  // dz/dy(x = 0) = 0
            // z[getIndex(m, K-1)] = z[getIndex(m, K-2)]; // dz/dy(x = X) = 0
        }
    
        // Ограничение в центре
        z[center_idx] = settings.F(time);
        // Ограничения по углам
        z[getIndex(0, 0)] = 0;
        z[getIndex(1, 0)] = 0;
        z[getIndex(0, 1)] = 0;
        
        z[getIndex(0, K-1)] = 0;
        z[getIndex(1, K-1)] = 0;
        z[getIndex(0, K-2)] = 0;
    
        z[getIndex(M-1, 0)] = 0;
        z[getIndex(M-1, 1)] = 0;
        z[getIndex(M-2, 0)] = 0;
    
        z[getIndex(M-1, K-1)] = 0;
        z[getIndex(M-2, K-1)] = 0;
        z[getIndex(M-1, K-2)] = 0;
        
        // Обновление скоростей и вершин
        for (let i = 0; i < length; i++){
            const i3 = 3*i + 2;
            velosities[i3] = (z[i] - vertices[i3])/dt;
            vertices[i3] = z[i];
        }
    }
}
