function [jsa_Ni,Ri]=SingleRate_idler(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,...
                                       ang_extg,deff,Pav,L,z0,zi,Nz,oms,omi)
c=3e14;
eps0=8.8542e-18;  % F/micrometros 

%/////////////////////////////////////////////////////

sigma = (2*pi*c/(lamp-FWHM_spec/2) - 2*pi*c/(lamp+FWHM_spec/2))*sqrt(2)/(2*sqrt(log(2)));
W0 = FWHM_waist*sqrt(2)/(2*sqrt(log(2)));
W0x = W0; % beamwaist x
W0y = W0; % beamwaist y
Wf = FWHM_waist_fcm*sqrt(2)/(2*sqrt(log(2)));
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

% thetas=ang_int;  %%%% angulo interno
thetai=-ang_int;  %%%% angulo interno

%%%%%%%%%%%%%%%%%%%% walk off angle %%%%%%%%%%%%
rho=0*walkoff(omp0,ang);

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
thetai_f=-ang_ext; %%%% angulo exterior

hi=L*tan(thetai)/2;

omp=oms+omi;

kp= indxExAng_BBO(omp,ang).*omp./c;
ksf= oms./c;  %%% magnitud de k en el espacio libre
kif= omi./c;  %%% magnitud de k en el espacio libre
ks=indxOr_BBO(oms).*ksf; %%% magnitud de k en el cristal
ki=indxOr_BBO(omi).*kif; %%% magnitud de k en el cristal

WWfi=Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));

PUMP=exp(-(oms+ omi-omp0).^2./sigma^2);
dws=abs(oms(1,2)-oms(1,1));
dwi=abs(omi(2,1)-omi(1,1));
ell=(oms./indxOr_BBO(oms).^2).*(omi./indxOr_BBO(omi).^2);

etaNi=(sec(thetai_f)/(2^2*pi^5*sqrt(2*pi)*c^3*eps0))*deff^2*L^2*W0x*W0y*Wfi^2*Pav/sigma;
gwswi_Ni = intkPM_Ns(L,ks,ki,kp,W0x,W0y,WWfi,z0,tan(rho),sec(thetai_f)^2,kif.*sin(thetai_f),hi,Nz);         

jsa_Ni=real(gwswi_Ni).*abs(PUMP).^2;
Ri=(2*pi)^3*etaNi*sum(sum(ell.*jsa_Ni))*dws*dwi;




