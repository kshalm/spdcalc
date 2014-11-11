function Int=intkPM_Ns(L,ks,ki,kp,Wx,Wy,Wfs,z0,Rho,Phis,Psis,hs,Npuntos,LAM)

Xi1=linspace(-1,1,Npuntos);
Xi2=linspace(-1,1,Npuntos);

dxi=abs(Xi1(2)-Xi1(1));

Int=zeros(length(ks));


for mm=1:Npuntos
    for nn=1:Npuntos

        [EE,FF,GG,HH,II,AA1,AA2,BB1,BB2]=Aux2(Xi1(mm),Xi2(nn),L,ks,ki,kp,Wx,Wy,Wfs,z0,Rho,Phis,Psis,hs,LAM);
        Int= Int + (0.5*0.5).*( exp(-GG.^2./(4.*EE) - HH.^2./(4.*FF) + II)./ (8.*sqrt(AA1.*AA2.*BB1.*BB2.*EE.*FF))).*dxi.^2;
    end 
end
          

       

