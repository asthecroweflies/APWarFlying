syms x;

% Log-distance path loss model:
% PL(d) = PL0 - 10 * a * log(d/d0) + X

% PL(d) : reduction in signal strength propagating thru ref. distance d
% n     : path loss factor (signal propagation constant)
% PL0   : power loss (dB) @ reference distance (usually 1m)
% X     : random env noise following X ~ N(0, oX^2)

PL0 = 27;
n  = 2.1;
X = 0;
syms d;

PL(d) = PL0 + 10 * n * log(d / 1) + X;

%fplot(PL(d));

xlabel("Distance (m)");
ylabel("Pathloss (dBm)");
title("Path Attenuation Prediction Model");
ylim([0, 80]);
xlim([0,7]);

% Free Space Path Loss
% F(dB) = 20log10(d) + 20log10(f) + 92.45
%
% d: distance (km)
% f: frequency (GHz)

F(d) = (20 * log(d / 1000)) + (20 * log(2412)) + 92.45;
fplot(F(d));
