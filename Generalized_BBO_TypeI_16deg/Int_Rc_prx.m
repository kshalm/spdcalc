function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos)



Xi=linspace(-1,1,Npuntos);
dXi=abs(Xi(2)-Xi(1));

z=zeros(length(kp));


for jj=1:Npuntos
    
%[A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);
 [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(0,L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);

% EXP1 = 4.*A11
% EXP2 = A2.^2./A1
% EXP3 = A4.^2./A3
% EXP4 = (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2))
% EXP5 = (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7))
% EXPtot = EXP1 - EXP2 - EXP3 -EXP4 -EXP5
ze = (4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.
% diff = EXPtot/4 - ze
zd = (sqrt(-A1).*sqrt(-A3).*sqrt(A10.^2./A3 - 4.*A7).*sqrt(-4.*A5 + A9.^2./A1));
den1 = A1.*A3
den2 = A10.^2./A3 - 4.*A7
den3 = -4.*A5 + A9.^2./A1
zz = (exp(ze)./zd);

Aten = A10
Athree = A3
Aseven = A7

z = z + 0.5.*dXi.*zz;
     
end
% az = z

       

   



