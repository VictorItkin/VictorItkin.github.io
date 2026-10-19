clc
clear

L = 1; % длина, м
q = L/2; % точка колебания, м
a = 0.1; b = 1000; % параметры закона колебания
F = @(t) a*sin(b*t); % закон колебания этой точки
f = @(t) a*b*cos(b*t); % производная по t
T = 1; % Н
rho = 1e-4; % кг/м
g = 9.81; % м/с^2

v = T/rho;

% Сетка
N = 501; M = 301;
dx = L/(M-1);
x = 0:dx:L;
mq = find(x == q);
if isempty(mq)
    error("Точка колебания не попала на сетку")
end
dt = dx/sqrt(v); % из условия устойчивости
r = v*dt^2/dx^2; % = 1
G = g*dt^2;
t = 0:dt:(N-1)*dt;
z = zeros(N, M);

% Начальные условия
x_left = x(1:mq); x_right = x(mq+1:M) - q;
z(1, 1:mq) = rho*g/2/T*(x_left.^2 - q*x_left);
z(1, mq+1:M) = rho*g/2/T*(x_right.^2 - (L-q)*x_right); 
if z(1, mq) ~=  F(0)
    error("Противоречие в начальных условиях")
end
z(2, :) = z(1, :); z(2, mq) = z(2, mq) + f(0)*dt;
% Разностная схема
for n = 2:N-1
    z(n+1, 1) = 0; % левое граничное условие
    for m = 2:M-1
        if m == mq
           z(n+1, mq) = F(t(n)); % центральное условие
        else % разностная схема
            z(n+1, m) = 2*z(n, m) - z(n-1, m) + r*(z(n, m+1) - 2*z(n, m) + z(n, m-1)) - G;
        end
    end
    z(n+1, M) = 0; % правое граничное условие
end
% Визуализация
figure(1)
hold off
for n = 1:N
    plot(x, z(n, :), "k", LineWidth = 2)
    grid on
    axis([0, L, -3*a, 3*a])
    title("n = " + round(n, -1) + " / " + N);
    pause(0.01)
end
