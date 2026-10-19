clc
clear
alpha = 0:pi/200:2*pi;
k = 4/3;
A = k*(cos(alpha) - 1);
lambda1 = (A+2 + sqrt(A.^2 + 2.*A))/2;
lambda2 = (A+2 - sqrt(A.^2 + 2.*A))/2;


figure(1)
hold off
plot(lambda1)
grid on
hold on
plot(lambda2)