function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos)



Xi=linspace(-1,1,Npuntos);
dXi=abs(Xi(2)-Xi(1));

z=zeros(length(kp));


for jj=1:Npuntos
    
    [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);

z = z + 0.5.*dXi.*(exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)./...
     (sqrt(-A1).*sqrt(-A3).*sqrt(A10.^2./A3 - 4.*A7).*sqrt(-4.*A5 + A9.^2./A1)));
     
     
     
     
end


       

   



