function getConnections(M, K){
    const getIndex = (m, k) => m*K + k;

    const x_connections = [];
    const y_connections = [];
    const diag_connections = [];
    for (let k = 0; k < K; k++)
        for (let m = 0; m < M; m++){
            const currentVertex_idx = getIndex(m, k);
            // Горизонтальные связи (вправо)
            if (m < M-1) { // Если мы не у правого края
                const rightNeighbor_idx = getIndex(m+1, k);
                x_connections.push(currentVertex_idx, rightNeighbor_idx);
            }
            // Вертикальные связи (вверх) 
            if (k < K-1) {// Если мы не у верхнего края
                const topNeighbor_idx = getIndex(m, k+1);
                y_connections.push(currentVertex_idx, topNeighbor_idx);
            }
            // Диагональные связи (вправо-вверх)
            if (m < M-1 && k < K-1) {
                const diagNeighbor_idx = getIndex(m+1, k+1);
                diag_connections.push(currentVertex_idx, diagNeighbor_idx);
            }
        }

    return {x: x_connections, y: y_connections, diag: diag_connections,}
}

export {getConnections};
