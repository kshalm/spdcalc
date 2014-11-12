function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos,LAM)



% Xi=linspace(-1,1,Npuntos);
% dXi=abs(Xi(2)-Xi(1));

Xi=linspace(0,0,Npuntos);
Xi(1) = 0;
dXi = 1;

z=zeros(length(kp));


for jj=1:Npuntos
    
    [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,LAM);

    z = z + 0.5.*dXi.*(exp((4.*A10 - A5.^2./A1 - A6.^2./A2 - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)) - ...
            (A6.^2.*(-2.*A2 + A9).^2)./(A2.*(4.*A2.*A4 - A9.^2)))./4.)./ ...
       		(sqrt(-A1).*sqrt(-A2).*sqrt(-4.*A3 + A8.^2./A1).*sqrt(-4.*A4 + A9.^2./A2)))

    den = (sqrt(-A1).*sqrt(-A2).*sqrt(-4.*A3 + A8.^2./A1).*sqrt(-4.*A4 + A9.^2./A2))
    AA = A1*A2
    BB = (-4.*A3 + A8.^2./A1)
    CC = (-4.*A4 + A9.^2./A2)
   
end


      


% function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos,LAM)



% % Xi=linspace(-1,1,Npuntos);
% % dXi=abs(Xi(2)-Xi(1)); 
% Xi=linspace(0,0,Npuntos);
% Xi(1) = 0;
% dXi = 1;

% z=zeros(length(kp));


% for jj=1:Npuntos
    
%     [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,LAM)

%     z = z + 0.5.*dXi.*(exp((4.*A10 - A5.^2./A1 - A6.^2./A2 - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)) - ...
%             (A6.^2.*(-2.*A2 + A9).^2)./(A2.*(4.*A2.*A4 - A9.^2)))./4.)); %./ ...
%        %(sqrt(-A1).*sqrt(-A2).*sqrt(-4.*A3 + A8.^2./A1).*sqrt(-4.*A4 + A9.^2./A2)));
   
% %    ks  
% %    num = ((4.*A10 - A5.^2./A1 - A6.^2./A2 - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)) - ...
% %             (A6.^2.*(-2.*A2 + A9).^2)./(A2.*(4.*A2.*A4 - A9.^2)))./4.)
% %      abs(exp((4.*A10 - A5.^2./A1 - A6.^2./A2 - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)) - ...
% %             (A6.^2.*(-2.*A2 + A9).^2)./(A2.*(4.*A2.*A4 - A9.^2)))./4.))
%      aa = ((exp((4.*A10))))
%      bb = exp(- A5.^2./A1)
%      cc = exp(- A6.^2./A2)
%      dd = exp( - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)))
%      ee = exp(- (A6.^2.*(-2.*A2 + A9).^2)./(A2.*(4.*A2.*A4 - A9.^2)))
    
     
% end

% abs(z)

   



