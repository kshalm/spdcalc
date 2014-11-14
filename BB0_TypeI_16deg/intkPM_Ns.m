function Int=intkPM_Ns(L,ks,ki,kp,Wx,Wy,W,z0,Rho,phis,Psis,hs,Npuntos)

xi_1=linspace(-1,1,Npuntos);
xi_2=linspace(-1,1,Npuntos);

dxi=abs(xi_1(2)-xi_1(1));

Int=zeros(length(ks));


for mm=1:Npuntos
    for nn=1:Npuntos

        [AA1a,AA2a,CC1a,CC2a,EE1a,EE2a,FF1a,FF2a,GG1a,GG2a,HH1a,HH2a,II1a,II2a]=auxint(xi_1(mm),L,ks,ki,kp,Wx,Wy,W,z0,Rho,phis,Psis,hs);
        [AA1b,AA2b,CC1b,CC2b,EE1b,EE2b,FF1b,FF2b,GG1b,GG2b,HH1b,HH2b,II1b,II2b]=auxint(xi_2(nn),L,ks,ki,kp,Wx,Wy,W,z0,Rho,phis,Psis,hs);

        den=2.*sqrt((AA1a+1i.*AA2a).*(CC1a+1i.*CC2a)).*conj(2.*sqrt((AA1b+1i.*AA2b).*(CC1b+1i.*CC2b)));

        Int= Int + (0.5*0.5).*((exp(-(GG1a + GG1b + 1i.*(GG2a - GG2b)).^2./...
           (4.*(EE1a + EE1b + ...
               1i.*(EE2a - EE2b))) - ... 
          (HH1a + HH1b + 1i.*(HH2a - HH2b)).^2./ ...
           (4.*(FF1a + FF1b +  ...
               1i.*(FF2a - FF2b))) + II1a + ...
          II1b + 1i.*II2a - 1i.*II2b)./  ...
       (2.*sqrt(-EE1a - EE1b - ...
           1i.*(EE2a - EE2b)).* ...
         sqrt(-FF1a - FF1b - 1i.*(FF2a - FF2b))))./den).*dxi.^2;
    end 
end
          

       


