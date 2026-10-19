clc
clear
use_gravity = false;
X = 1; % длина, м
Y = 1; % ширина, м
% Точка колебания, м
p = X/2; q = Y/2; 
a = 0.1; b = 0.1; % параметры закона колебания
F = @(t) [p, q, a*sin(b*t)]; % закон колебания этой точки
f = @(t) [p, q, a*b*cos(b*t)]; % производная по t
rho = 1e-2; % кг/м
if use_gravity
    g = 9.81; % м/с^2
else
    g = 0;
end
G = g*[0, 0, -1]; % вектор ускорения свободного падения, направлен вниз
% Сетка
M = 13; % длина (x)
K = 13; % ширина (y)
N = 200; % время
% Линейный индекс по парам индексов
get_index = @(m, k) m + (k-1)*M;

dx = X/(M-1); dy = Y/(K-1);
mass = rho*dx*dy/2; % масса, сосредоточенная в узле 
x = 0:dx:X; y = 0:dy:Y;
mp = find(x == p); kq = find(y == q);
if isempty(mp) || isempty(kq)
    error("Точка колебания не попала на сетку")
end
dt = 1;
t = 0:dt:(N-1)*dt;

points = cell(N, 1);
points(:) = {zeros(M*K, 3)}; % каждая строка - (x, y, z)
% Ограничения на расстояния между узлами - индексы связей
[x_connections, y_connections, diag_connections, init_points] = get_connections(x, y);
connections = [x_connections; y_connections; diag_connections];
% Ограничения в виде весов
weights = 1/mass*ones(M*K, 1);
corners_x = [1, 1, M, M];
corners_y = [1, K, 1, K]; 
corners_idx = get_index(corners_x, corners_y);
center_idx = get_index(mp, kq);
weights(corners_idx) = 0;
weights(center_idx) = 0;

% Начальные условия
points{1} = init_points;
forecasts = init_points;
velosities = zeros(M*K, 3);
for n = 1:N-1
    old_points = points{n};
    for i = 1:M*K
        velosities(i, :) = velosities(i, :) + dt*mass*G;
        forecasts(i, :) = old_points(i, :) + dt*velosities(i, :);
    end % i    
    forecasts(center_idx, :) = F(t(n+1));
    forecasts(corners_idx, :) = init_points(corners_idx, :);
    
    new_points = correct_positioins(forecasts, weights, x_connections, y_connections, ...
        diag_connections, dx, dy);

    velosities = (new_points - old_points)/dt;
    points{n+1} = new_points;
end % n


% Визуализация
figure(1);
h = mesh(zeros(M, K));
% Настройка вида (один раз)
view(3);
axis([0, X, 0, Y, -a, a])
grid on
for n = 1:N
    plot_surface(points{n}, M, K, h)
    pause(0.05)
end % n

function points = correct_positioins(points, weights, x_connections, y_connections, ...
        diag_connections, dx, dy)
    dl = sqrt(dx^2 + dy^2);
    
    MAX_NUM_OF_ITERATIONS = 300;
    EPS = 1e-4;
    
    points_base = points;
    for i = 1: MAX_NUM_OF_ITERATIONS
        points = correct_positioins_base(points, weights, x_connections, dx);
        points = correct_positioins_base(points, weights, y_connections, dy);
        points = correct_positioins_base(points, weights, diag_connections, dl);
        
        delta = abs(points - points_base)./(points_base + 1e-6);
        norm_delta = max(delta, [], "all");
        points_base = points;
        if norm_delta < EPS
            break
        end
    end % i
end % function
function points = correct_positioins_base(points, weights, connections, distance)
    num_of_connections = size(connections, 1);
    
    for i = 1:num_of_connections
        idx_a = connections(i, 1);
        idx_b = connections(i, 2);
       
        point_a = points(idx_a, :);
        point_b = points(idx_b, :);
        
        weight_a = weights(idx_a, :);
        weight_b = weights(idx_b, :);
        weight = weight_a + weight_b + 1e-14;
        
        old_delta = point_a - point_b;
        l = norm(old_delta, 2);

        new_delta = old_delta*(l - distance)/l;
        
        points(idx_a, :) = point_a - weight_a/weight * new_delta;
        points(idx_b, :) = point_b + weight_b/weight * new_delta;      
    end % i    
end % function

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

function plot_surface(points, Nx, Ny, h)
    X = reshape(points(:, 1), [Nx, Ny]);
    Y = reshape(points(:, 2), [Nx, Ny]); 
    Z = reshape(points(:, 3), [Nx, Ny]);
    
    h.XData = X;
    h.YData = Y; 
    h.ZData = Z; 
    
    drawnow limitrate;
end % function

