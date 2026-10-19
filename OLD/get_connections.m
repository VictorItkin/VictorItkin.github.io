function [x_connections, y_connections, diag_connections, init_points] = get_connections(x, y)
    M = length(x); 
    K = length(y);

    % Вспомогательная функция для перевода координат (i,j) в плоский индекс ID
    % Мы нумеруем узлы слева направо, сверху вниз (как читаем текст)
    get_index = @(m, k) m + (k-1)*M;

    x_connections = zeros(K*(M-1), 2);
    y_connections = zeros(M*(K-1), 2);
    diag_connections = zeros((M-1)*(K-1), 2);

    init_points = zeros(M*K, 3);

    x_count = 0;
    y_count = 0;
    diag_count = 0;
    for k = 1:K
        for m = 1:M
            current_point_idx = get_index(m, k);
            % --- Горизонтальные связи (вправо) ---
            if m < M % Если мы не у правого края
                right_neighbor_idx = get_index(m+1, k);
                x_count = x_count + 1;
                x_connections(x_count, :) = [current_point_idx, right_neighbor_idx];
            end
            % --- Вертикальные связи (вверх) ---
            if k < K % Если мы не у верхнего края
                top_neighbor_id = get_index(m, k+1);
                y_count = y_count + 1;
                y_connections(y_count, :) = [current_point_idx, top_neighbor_id];
            end
            % --- Диагональные связи (вправо-вверх) ---
            if (m < M) && (k < K)
                diag_neighbor_id = get_index(m+1, k+1);
                diag_count = diag_count + 1;
                diag_connections(diag_count, :) = [current_point_idx, diag_neighbor_id];
            end
%             --- Диагональные связи (влево-вверх) - не используем сейчас ---
%             if (m < M) && (k > 1)
%                 diag_neighbor_id = get_index(m+1, k-1);
%                 diag_count = diag_count + 1;
%                 diag_connections(diag_count, :) = [current_point_idx, diag_neighbor_id];
%             end
            init_points(current_point_idx, :) = [x(m), y(k), 0];
        end % i
    end % j
end % function
