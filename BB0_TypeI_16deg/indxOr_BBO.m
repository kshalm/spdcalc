function no = indxOr_BBO(omega)

cc=3e14; % speed of light (micras/s)

A= 2.7359;
B=0.01878;  % micras^2
C=-0.01822; % micras^2
D=-0.01354; % micras^-2

lam=(2*pi*cc)./omega;


no= sqrt(A + B./(lam.^2 + C)+ D.*lam.^2);

