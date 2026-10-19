function constraints = get_constraints(x, y)
M = length(x); 
K = length(y);

% Вспомогательная функция для перевода координат (i,j) в плоский индекс ID
% Мы нумеруем узлы слева направо, снизу вверх (как читаем текст)
getID = @(i, j) i + (j-1)*M;

% Максимально возможное число связей до обрезки краев
max_constraints = 2 * (M)*(K-1) + 2*(M-1)*(K) + (M-1)*(K-1); 
constraints = zeros(max_constraints, 2);
count = 0; % количество записанных связей

for k = 1:K
    for m = 1:M
        current_particle_id = getID(m, k);
        % --- Горизонтальные связи (вправо) ---
        if m < M % Если мы не у правого края
            right_neighbor_id = getID(m+1, k);
            count = count + 1;
            constraints(count, :) = [current_particle_id, right_neighbor_id];
        end
        % --- Вертикальные связи (вверх) ---
        if k < K % Если мы не у верхнего края
            top_neighbor_id = getID(m, k+1);
            count = count + 1;
            constraints(count, :) = [current_particle_id, top_neighbor_id];
        end
        % --- Диагональные связи (вправо-вверх) ---
        if (m < M) && (k < K)
            diag_neighbor_id = getID(m+1, k+1);
            count = count + 1;
            constraints(count, :) = [current_particle_id, diag_neighbor_id];
        end
    end % i
end % j
constraints = constraints(1:count, :);
