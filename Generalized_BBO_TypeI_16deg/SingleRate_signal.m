function [jsa_Ns,Rs]=SingleRate_signal(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,...
                                       ang_extg,deff,Pav,L,z0,zs,Nz,oms,omi)
mu = 1e-6;
c=3e14 * mu;
eps0=8.8542e-18 * mu;  % F/micrometros 

%/////////////////////////////////////////////////////

sigma = (2*pi*c/(lamp-FWHM_spec/2) - 2*pi*c/(lamp+FWHM_spec/2))*sqrt(2)/(2*sqrt(log(2)));
W0 = FWHM_waist*sqrt(2)/(2*sqrt(log(2)));
W0x = W0; % beamwaist x
W0y = W0; % beamwaist y
Wf = FWHM_waist_fcm*sqrt(2)/(2*sqrt(log(2)));
Wfs=Wf;
Wfi=Wf;

%%% central frequencies %%%%
omp0=(2*pi*c)/lamp;
oms0=(2*pi*c)/lams;
omi0=(2*pi*c)/lami;
%%% external emission angle %%%
ang_ext=ang_extg*pi/180; % radians
%%% internal angle %%%
ang_int=asin(sin(ang_ext)./indxOr_BBO(oms0)); % radians
%%% phase matching angle %%%
angd=thcut(oms0,ang_int*180/pi); % degrees
ang=angd.*pi./180; % radians
thetas=ang_int;  %%%% angulo interno
thetai=-ang_int;  %%%% angulo interno
%%%%%%%%%%%%%%%%%%%% walk off angle %%%%%%%%%%%%
rho=1*walkoff(omp0,ang);
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
thetas_f=ang_ext; %%%% angulo exterior
thetai_f=-ang_ext; %%%% angulo exterior

hs=L*tan(thetas)/2;
hi=L*tan(thetai)/2;

omp=oms+omi;

kp= indxExAng_BBO(omp,ang).*omp./c;
ksf= oms./c;  %%% magnitud de k en el espacio libre
kif= omi./c;  %%% magnitud de k en el espacio libre
ks=indxOr_BBO(oms).*ksf; %%% magnitud de k en el cristal
ki=indxOr_BBO(omi).*kif; %%% magnitud de k en el cristal

WWfs=Wfs.*sqrt( 1 + 2.*1i.*(zs+hs.*sin(thetas_f))./(ksf.*Wfs^2));


PUMP=exp(-(oms+ omi-omp0).^2./sigma^2);
dws=abs(oms(1,2)-oms(1,1));
dwi=abs(omi(2,1)-omi(1,1));
ell=(oms./indxOr_BBO(oms).^2).*(omi./indxOr_BBO(omi).^2);

etaNs=(sec(thetas_f)/(2^2*pi^5*sqrt(2*pi)*c^3*eps0))*deff^2*L^2*W0x*W0y*Wfs^2*Pav/sigma;
gwswi_Ns = intkPM_Ns(L,ks,ki,kp,W0x,W0y,WWfs,z0,tan(rho),sec(thetas_f)^2,ksf.*sin(thetas_f),hs,Nz);         
    
jsa_Ns=real(gwswi_Ns).*abs(PUMP).^2;
MaxjsaSingles = max(max(jsa_Ns))
Rs=(2*pi)^3*etaNs*sum(sum(ell.*jsa_Ns))*dws*dwi;
MaxRs = max(max((2*pi)^3*etaNs*((ell.*jsa_Ns))*dws*dwi))
