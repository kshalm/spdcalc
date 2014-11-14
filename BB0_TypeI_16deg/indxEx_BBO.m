function ne = indxEx_BBO(omega)

cc=3e14; % speed of light (micras/s)

A= 2.3753;
B=0.01224;  % micras^2
C=-0.01667; % micras^2
D=-0.01516; % micras^-2

lam=(2*pi*cc)./omega;


ne= sqrt(A + B./(lam.^2 + C)+ D.*lam.^2);