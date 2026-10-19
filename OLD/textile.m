clc
clear
useGravity = true;
X = 2; % длина, м
Y = 1; % ширина, м
% Точка колебания, м
p = X/2; q = Y/2; 
a = 0.1; b = 1000; % параметры закона колебания
F = @(t) a*sin(b*t); % закон колебания этой точки
f = @(t) a*b*cos(b*t); % производная по t
T = 100; % Н
rho = 1e-3; % кг/м
if useGravity
    g = 9.81; % м/с^2
else
    g = 0;
end

v = T/rho;

% Сетка
M = 51; % длина (x)
K = 51; % ширина (y)
N = 401; % время
dx = X/(M-1); dy = Y/(K-1);
x = 0:dx:X; y = 0:dy:Y;
mp = find(x == p); kq = find(y == q);
if isempty(mp) || isempty(kq)
    error("Точка колебания не попала на сетку")
end
dt = 1/sqrt(v)/sqrt(1/dx^2 + 1/dy^2); % из условия устойчивости
rx = v*dt^2/dx^2; ry = v*dt^2/dx^2;
G = g*dt^2;
t = 0:dt:(N-1)*dt;
z = zeros(M, K, N);

% Начальные условия
z(:, :, 1) = 0;
if z(mp, kq, 1) ~=  F(0)
    error("Противоречие в начальных условиях")
end
z(:, :, 2) = z(:, :, 1); z(mp, kq, 2) = z(mp, kq, 2) + f(0)*dt;
% Разностная схема
for n = 2:N-1
    z(1, 1, n+1) = 0; % угол 1
    z(1, K, n+1) = 0; % угол 2
    z(M, 1, n+1) = 0; % угол 3
    z(M, K, n+1) = 0; % угол 4
    for m = 2:M-1
        for k = 2:K-1
            if m == mp && k == kq
               z(mp, kq, n+1) = F(t(n)); % центральное условие
            else % разностная схема
                z(m, k, n+1) = 2*z(m, k, n) - z(m, k, n-1) + ...
                    rx*(z(m+1, k, n) - 2*z(m, k, n) + z(m-1, k, n)) + ...
                    ry*(z(m, k+1, n) - 2*z(m, k, n) + z(m, k-1, n)) - G;
            end
            if k > 2 && k < K-1
                z(1, k, n+1) = z(2, k, n); % dz/dy(x = 0) = 0
                z(M, k, n+1) = z(M-1, k, n); % dz/dy(x = X) = 0
            end
        end % k
        if m > 2 && m < M-1
            z(m, 1, n+1) = z(m, 2, n); % dz/dy(y = 0) = 0
            z(m, K, n+1) = z(m, K-1, n); % dz/dy(y = Y) = 0
        end
    end % m
end % n
% Визуализация
figure(1)
hold off
[xGrid, yGrid] = ndgrid(x, y);
zMax = max(z, [], "all");
zMin = min(z, [], "all");
for n = 1:N
    mesh(xGrid, yGrid, z(:, :, n))
    grid on
    axis([0, X, 0, Y, zMin, zMax])
   
    title("n = " + round(n, -1) + " / " + N);
    pause(0.01)
end % n
