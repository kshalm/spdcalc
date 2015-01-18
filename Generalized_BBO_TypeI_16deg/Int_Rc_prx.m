function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos)



Xi=linspace(-1,1,Npuntos);
dXi=abs(Xi(2)-Xi(1));

z=zeros(length(kp));
Xi = 0;
% ks
% ki
% kp
% Wx
% Wfs
Phis
Psis
Phii
Psii

% Cs =   -0.25 * (L  ./ ks - 2*z0./kp)
% CSI = (0.25.*1i.*(ks.*(2.*z0 - L.*Xi) + ...
%       kp.*(L.*(-1 + Xi) )))./(kp.*ks)
% CSR = (0.25.*ks.*(Wx.^2 + Wfs.^2.*Phis))./(kp.*ks)

% A1 = (0.25.*1i.*(ks.*(2.*z0 - L.*Xi) + ...
%       kp.*(L.*(-1 + Xi) + ...
%       1i.*ks.*(Wx.^2 + Wfs.^2.*Phis))))./(kp.*ks)

for jj=1:Npuntos
    
	%[A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);
	 [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(0,L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);

	EXP1 = 4.*A11;
	EXP2 = A2.^2./A1;
	EXP3 = A4.^2./A3;
	EXP4 = (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2));
	EXP5 = (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7));
	% EXPtot = EXP1 - EXP2 - EXP3 -EXP4 -EXP5
	ze = (4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.;
	% diff = EXPtot/4 - ze
	zd = (sqrt(-A1).*sqrt(-A3).*sqrt(A10.^2./A3 - 4.*A7).*sqrt(-4.*A5 + A9.^2./A1));
	den1 = A1.*A3;
	den2 = A10.^2./A3 - 4.*A7;
	den3 = -4.*A5 + A9.^2./A1;
	zz = (exp(ze)./zd);

	% Aten = A10
	% Athree = A3
	% Aseven = A7
	% Afive = A5
	% Anine = A9
	% Aone = A1

	z = z + 0.5.*dXi.*zz;
     
end
% zz
% ze 
% zd

EXP1
EXP2
EXP3
EXP4
EXP5

EXP4num = (-2.*A1.*A6 + A2.*A9).^2
EXP4den = (A1.*(4.*A1.*A5 - A9.^2))

% Exp4 =  (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
% EXP4 = (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2));

% A1 -> A1
% A6 -> A7
% A2 - A5
% A9 -> A8
% A5 -> A3

% Me = Karina
A1 = A1
A3 = A5
A5 = A2
A7 = A6
A8 = A9
% A1
% A3
% den1
% den2
% den3
% zdd = sqrt(den1*den2*den3)
% az = z

       

   



