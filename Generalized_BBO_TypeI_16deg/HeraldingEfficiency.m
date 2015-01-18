%%%%% Heralding efficiency in fiber-coupled SPDC %%%%%
% engineered

clear all
close all
clc
format long e

tic
% distances in microns

% % source parameters %
% c=3e14; 
% deff=1.64e-6; % microns/Volts
% Pav=1e-3; % pump power
% L=300;    %crystal length
% z0=0;     % pump beamwaist position
% zs=100;  % collection waist location (idler)
% zi=50;     % collection waist location (idler)
% 
% %%% range and resolution of vectors and matrices %%%
% NN=40; % points in vectors
% Nz=40;
% 
% % omegas-omegai % 
% lams_min=0.72639;
% lams_max=0.89361;
% lami_min=0.72639;
% lami_max=0.89361;
% 
% %%% pump parameters %%%
% lamp=0.405;  % central wavelength
% FWHM_spec=9e-3; % bandwidth
% FWHM_waist=60;  % waist
% 
% % signal / idler parameters %
% lams=0.810;    % central wavelength
% lami=0.810;    % central wavelength
% FWHM_waist_fcm=60; % collection mode waist
% ang_extg=16;  % external emission angle (degrees)

% source parameters %
mu = 1e-6;
c=3e14 * mu; 
deff=1.64e-6 * mu; % microns/Volts
Pav=1e-3 ; % pump power
L=300 * mu;    %crystal length
z0=0 * mu;     % pump beamwaist position
zs=0 * mu;  % collection waist location (idler)
zi=0 * mu;     % collection waist location (idler)

%%% range and resolution of vectors and matrices %%%
NN=2; % points in vectors
Nz=40;

% % omegas-omegai % 
% lams_min=0.74822 * mu;
% lams_max=0.87178 * mu;
% lami_min=0.75640 * mu;
% lami_max=0.8829 * mu;
lams_min=0.81 * mu;
lams_max=0.81 * mu;
lami_min=0.81 * mu;
lami_max=0.81 * mu;

%%% pump parameters %%%
lamp=0.405* mu;  % central wavelength
FWHM_spec=9e-3* mu; % bandwidth
FWHM_waist=59.99822837* mu;  % waist
% waist = FWHM_waist *sqrt(2)/(2*sqrt(log(2)))
% waist

% signal / idler parameters %
lams=0.810* mu;    % central wavelength
lami=0.810* mu;    % central wavelength
FWHM_waist_fcm=59.99822837* mu; % collection mode waist
ang_extg=16;  % external emission angle (degrees)

[oms,omi]=meshgrid(linspace((2*pi*c)/lams_max,(2*pi*c)/lams_min,NN),linspace((2*pi*c)/lami_max,(2*pi*c)/lami_min,NN));

%%%%%  coincidence rate %%%%%%
[jsa,Rc,K]=FC_JSA(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,...
                              ang_extg,deff,Pav,L,z0,zs,zi,Nz,oms,omi);

% %%%%%  single detection rates %%%%%%
%                           
% [jsa_Ns,Rs]=SingleRate_signal(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,...
%                                        ang_extg,deff,Pav,L,z0,zs,Nz,oms,omi);
% 
% [jsa_Ni,Ri]=SingleRate_idler(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,...
%                                        ang_extg,deff,Pav,L,z0,zi,Nz,oms,omi);
% 
% %%%% purity and efficiencies  %%%%% 
% purity=1/K    % purity
% etas=Rc/Rs    % heralding efficiency
% etai=Rc/Ri    % heralding efficiency
% 
% 
% colormap gray
% cmap = colormap;
% cmap = flipud(cmap);
% 
% figure(1)
% pcolor((1e3*2*pi*3e14)./oms,(1e3*2*pi*3e14)./omi,(abs(jsa).^2)./max(max(abs(jsa).^2))),shading interp
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
% axis on  
% 
% figure(2)
% pcolor((1e3*2*pi*3e14)./oms,(1e3*2*pi*3e14)./omi,(jsa_Ns)./max(max(jsa_Ns))),shading interp
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
% axis on    
% 
% figure(3)
% pcolor((1e3*2*pi*3e14)./oms,(1e3*2*pi*3e14)./omi,(jsa_Ni)./max(max(jsa_Ni))),shading interp
% colormap(cmap)
% set(gcf,'Color',[1,1,1])
% set(gca,'TickDir','out','TickLength',[0.015 0.015])
% set(gca,'FontSize',18,'FontName','arial')
% box on
% axis square
% sc =1e6;
% xlim([lams_min*sc lams_max*sc ])
% ylim([lami_min*sc  lami_max*sc ])
% xlabel('wavelength of signal (nm)')
% ylabel('wavelength of idler (nm)')
% axis on           


% figure(4)
% plot(z,purity,'k','linewidth',2)
% set(gcf,'Color',[1,1,1])
% set(gca,'TickDir','out','TickLength',[0.015 0.015])
% set(gca,'FontSize',18,'FontName','arial')
% box on
% axis square
% 
% figure(5)
% plot(z,etas,'k','linewidth',2)
% set(gcf,'Color',[1,1,1])
% set(gca,'TickDir','out','TickLength',[0.015 0.015])
% set(gca,'FontSize',18,'FontName','arial')
% box on
% axis square
%
% figure(6)
% plot(z,etai,'k','linewidth',2)
% set(gcf,'Color',[1,1,1])
% set(gca,'TickDir','out','TickLength',[0.015 0.015])
% set(gca,'FontSize',18,'FontName','arial')
% box on
% axis square
%A1R: -1.351311918465241e-9   A2R: -1.2979512499999998e-9A3R: -1.351311940776325e-9   A4R: -1.2979512499999998e-9A5R: 0.0030029936803279505   A6R: 0A7R: -0.0030037359274694255   A8R: -1.2979512499999998e-9A9R: -1.2979512499999998e-9   A10R: -6421.567718804624
                                   