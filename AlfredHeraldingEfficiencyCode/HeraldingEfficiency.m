close all
clear all
clc
tic

c=3e14;           % speed of light in vacuum  (microns/s)
eps0=8.8542e-18;  % vacuum permittivity (F/microns) 
deff=3.92e-6;     % microns/Voltios

Pav=1e-3;   % average pump power (W)
L=10000;    % crystal lenght (microns)

% % wavelength range 800nm% 
% lams_min=0.80948;
% lams_max=0.81052;
% lami_min=0.80948;
% lami_max=0.81052;
% 
% %%% pump parameters %%%
% lamp=0.405;        % pump central wavelength
% FWHM_spec=0.05e-3; % pump bandwidth 
% FWHM_waist=70;     % pump beamwaist
% 
% % signal / idler parameters %
% lams=0.81;          % signal central wavelength
% lami=0.81;          % idler central wavelength
% FWHM_waist_fcm=120; % collection mode waist
% 
% NN=30;    % points in frequency vectors
% xipunt=30; % points in xi-vectors

% 1550 nm
% wavelength range % 
lams_min=1.5499;
lams_max=1.55;
lami_min=1.5499;
lami_max=1.55;

%%% pump parameters %%%
lamp=0.775;        % pump central wavelength
FWHM_spec=1.e-3; % pump bandwidth 
FWHM_waist=220;     % pump beamwaist

% signal / idler parameters %
lams=2*lamp;          % signal central wavelength
lami=2*lamp;          % idler central wavelength
FWHM_waist_fcm=120; % collection mode waist

NN=2;    % points in frequency vectors
xipunt=1; % points in xi-vectors

%************************************************
LAM =-polingPer(lamp,lams,-46)   % poling period
% LAM =  -46.48;

omgp0=(2*pi*c)/lamp;  % pump central frequency
omgs0=(2*pi*c)/lams;  % signal central frequency
omgi0=(2*pi*c)/lami;  % idler central frequency

sigma = (2*pi*c/(lamp-FWHM_spec/2) - 2*pi*c/(lamp+FWHM_spec/2))*sqrt(2)/(2*sqrt(log(2))); % pump bandwidth(HW1/eM amplitude)
W0 = FWHM_waist*sqrt(2)/(2*sqrt(log(2))); % pump beam waist (HW1/eM amplitude)
Wx=W0;
Wy=W0;
Wfs = FWHM_waist_fcm*sqrt(2)/(2*sqrt(log(2))); % collection mode waist (HW1/eM amplitude)
Wfi = FWHM_waist_fcm*sqrt(2)/(2*sqrt(log(2))); % collection mode waist (HW1/eM amplitude)

oms_min=(2*pi*c)/lams_max;
oms_max=(2*pi*c)/lams_min;
omi_min=(2*pi*c)/lami_max;
omi_max=(2*pi*c)/lami_min;

% [oms,omi]=meshgrid(linspace(oms_min,oms_max,NN),linspace(omi_min,omi_max,NN));  % omegas-omegai matrices
% dws=abs(oms(1,2)-oms(1,1));
% dwi=abs(omi(2,1)-omi(1,1));
% omp=oms+omi;


oms = omgs0;
omi = omgi0;
omp = omgp0;

kp=k_y((2*pi*c)./omp);  
ks=k_y((2*pi*c)./oms);
ki=k_z((2*pi*c)./omi);

ell=(oms./IndxRefr_y((2*pi*c)./oms).^2).*(omi./IndxRefr_z((2*pi*c)./omi).^2);

alpha=exp(-(omp-omgp0).^2./sigma^2);  % pump spectral amplitude 

%%%%%%%%%  joint spectrum (coincidences) %%%%%%%%
phi_Rc=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,1,1,0,0,0,0,0,0,xipunt,LAM); % phase-matching function


% phi_Rc=Int_Rc_prx(L,ks,ki,kp,Wx,Wy,Wfs,Wfi,1,1,0,0,0,0,0,0,xipunt,LAM); % phase-matching function
% % jsa=alpha.*phi_Rc;  % JSA
% jsa=phi_Rc;  % JSA
% K=SchmidtK(jsa);  % Schmidt number

% %%%%%%%% emission rate Rc %%%%%%%

% etaN=(4/pi^2)*(sec(0)*sec(0)/(2^3*pi^6*sqrt(2*pi)*c^3*eps0))*deff^2*L^2*Wx*Wy*Wfs^2*Wfi^2*Pav/sigma;

% Rc=(2*pi)^4*etaN*sum(sum(ell.*abs(jsa).^2))*dws*dwi;

% %%%%%%%%%  joint spectrum (single s) %%%%%%%%

% phi_Rs=intkPM_Ns(L,ks,ki,kp,Wx,Wy,Wfs,0,0,1,0,0,xipunt,LAM);
% JSIs=abs(alpha).^2.*real(phi_Rs);

% etaNs=(4/pi^2)*(sec(0)/(2^2*pi^5*sqrt(2*pi)*c^3*eps0))*deff^2*L^2*Wx*Wy*Wfs^2*Pav/sigma;
% Rs=(2*pi)^3*etaNs*sum(sum(ell.*JSIs))*dws*dwi;

% %%%%%%%%%  joint spectrum (single i)  %%%%%%%

% phi_Ri=intkPM_Ns(L,ks,ki,kp,Wx,Wy,Wfi,0,0,1,0,0,xipunt,LAM);
% JSIi=abs(alpha).^2.*real(phi_Ri);

% etaNi=(4/pi^2)*(sec(0)/(2^2*pi^5*sqrt(2*pi)*c^3*eps0))*deff^2*L^2*Wx*Wy*Wfi^2*Pav/sigma;
% Ri=(2*pi)^3*etaNi*sum(sum(ell.*JSIi))*dws*dwi;

% %%%% heralding efficiency %%%%%
% etas=Rc./Rs
% etai=Rc./Ri

% toc

% %%%%%%%%%%%% P L O T S %%%%%%%%%%%%%
% colormap gray
% cmap = colormap;
% cmap = flipud(cmap);

% figure(1)
% pcolor(1e3.*(2*pi*c)./oms,1e3.*(2*pi*c)./omi,abs(jsa).^2),shading interp
% colormap(cmap)
% set(gcf,'Color',[1,1,1])
% set(gca,'TickDir','out','TickLength',[0.015 0.015])
% set(gca,'FontSize',18,'FontName','arial')
% box on
% axis square
% xlim([lams_min*1e3 lams_max*1e3 ])
% ylim([lami_min*1e3  lami_max*1e3 ])
% xlabel('wavelength of signal (nm)')
% ylabel('wavelength of idler (nm)')
 
% % figure(2)
% % pcolor(1e3.*(2*pi*c)./oms,1e3.*(2*pi*c)./omi,JSIs),shading interp
% % colormap(cmap)
% % set(gcf,'Color',[1,1,1])
% % set(gca,'TickDir','out','TickLength',[0.015 0.015])
% % set(gca,'FontSize',18,'FontName','arial')
% % box on
% % axis square
% % xlim([lams_min*1e3 lams_max*1e3 ])
% % ylim([lami_min*1e3  lami_max*1e3 ])
% % xlabel('wavelength of signal (nm)')
% % ylabel('wavelength of idler (nm)')
% % 
% % figure(3)
% % pcolor(1e3.*(2*pi*c)./oms,1e3.*(2*pi*c)./omi,JSIi),shading interp
% % colormap(cmap)
% % set(gcf,'Color',[1,1,1])
% % set(gca,'TickDir','out','TickLength',[0.015 0.015])
% % set(gca,'FontSize',18,'FontName','arial')
% % box on
% % axis square
% % xlim([lams_min*1e3 lams_max*1e3 ])
% % ylim([lami_min*1e3  lami_max*1e3 ])
% % xlabel('wavelength of signal (nm)')
% % ylabel('wavelength of idler (nm)')


% % %%%%%%%%%%% S A V E   D A T A %%%%%%%%%%%%%

% % fname=strcat('Rc_W0400_Wfi25','.txt');
% % save(fname,'Rc','-ASCII','-double','-tabs');
% % 
% % fname=strcat('pureza_W0400_Wfi25','.txt');
% % save(fname,'Purity','-ASCII','-double','-tabs');
% % 
% % fname=strcat('Rs_W0400_Wfi25','.txt');
% % save(fname,'Rs','-ASCII','-double','-tabs');
% % 
% % fname=strcat('Ri_W0400_Wfi25','.txt');
% % save(fname,'Ri','-ASCII','-double','-tabs');
% % 
% % fname=strcat('Wf_W0400_Wfi25','.txt');
% % save(fname,'Wf','-ASCII','-double','-tabs');





