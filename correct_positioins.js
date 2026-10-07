function correctPositioins(vertices, weights, connections, settings, grid){
    const dx = grid.dx;
    const dy = grid.dy;
    const dl = Math.sqrt(dx**2 + dy**2);
    const maxNumOfIterations = settings.maxNumOfIterations;
    const tolerance = settings.tolerance;

    const baseVertices = [...vertices];
    for (let i = 0; i < maxNumOfIterations; i++){
        correctPositioinsBase(vertices, weights, connections.x, dx);
        correctPositioinsBase(vertices, weights, connections.y, dy);
        correctPositioinsBase(vertices, weights, connections.diag, dl);
        
        const delta = arrayDistance(vertices, baseVertices);
        for (let j = 0; j < vertices.length; j++)
            baseVertices[j] = vertices[j];

        if (delta < tolerance)
            break
    }
}
function correctPositioinsBase(vertices, weights, connections, distance){
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
function arrayDistance(a, b){
    if (a.length !== b.length)
        throw new Error("Массивы должны быть равной длины")
    
    let distance = 0.0;
    for (let i = 0; i < a.length; i++){
        distance = Math.max(distance, Math.abs(a[i] - b[i]));
    }
    return distance;
}
export {correctPositioins};
