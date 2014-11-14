function z=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,Npuntos)



% Xi=linspace(-1,1,Npuntos);
% dXi=abs(Xi(2)-Xi(1));

Xi=linspace(0,0,1);
Xi(1) = 0;
dXi=1;
z0 = 0;

z=zeros(length(kp));


for jj=1:Npuntos
    
    [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(Xi(jj),L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);


z = z + 0.5.*dXi.*(exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)./...
     (sqrt(-A1).*sqrt(-A3).*sqrt(A10.^2./A3 - 4.*A7).*sqrt(-4.*A5 + A9.^2./A1)));
   
% z = z + 0.5.*dXi.*(exp((4.*A10 - A5.^2./A1 - A6.^2./A2 - (A9.*A6 - 2.*A2.*A6).^2./(A2.*(-A9.^2 + 4.*A2.*A4)) - (-2.*A1.*A7 + A5.*A8).^2./(A1.*(4.*A1.*A3 - A8.^2)))./4.)./...
%      (sqrt(-A1).*sqrt(-A2).*sqrt(A9.^2./A2 - 4.*A4).*sqrt(-4.*A3 + A8.^2./A1)));

     
     
     % A1
     % A3
     % A5
     % A7
     % A2
     % A4
     % A6
     % A9
     % A10
     % A11
     num = exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)

     den = (sqrt(-A1).*sqrt(-A3).*sqrt(A10.^2./A3 - 4.*A7).*sqrt(-4.*A5 + A9.^2./A1))

     ratio = num/den *0.5

     term1 = 4.*A11
     term2 = A2.^2./A1
     term3 = A4.^2./A3
     term4 = (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2))
     term5 = (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7))


end


      

% % A1
% A1 

% % A5
% A2 

% % A2
% A3 

% %A6         
% A4 

% % A3
% A5 

% % A7
% A6 

% % A4
% A7 
         
% % A6        
% A8 

% %A8
% A9 

% %A9
% A10 

% %A10
% A11
   



