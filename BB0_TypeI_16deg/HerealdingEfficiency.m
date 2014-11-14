%%%%% Heralding efficiency in fiber-coupled SPDC %%%%%
% engineered

clear all
close all
clc
format long e
tic
% distances in microns

% source parameters %
c=3e14; 
eps0=8.8542e-18;  % F/microns
deff=1.64e-6; % microns/Voltios
Pav=1e-3; % pump power
L=300;   %crystal length
z0=0;  % pump beamwaist position

%%% range and resolution of vectors and matrices %%%
NN=2; % points in vectors
Nz=1;

% omegas-omegai % 
lams_min=0.72639;
lams_max=0.89361;
lami_min=0.74070;
lami_max=0.91537;

%%% pump parameters %%%
lamp=0.405; % central pump wavelength
FWHM_spec=9e-3; % bandwidth
FWHM_waist=60;  % waist

% signal / idler parameters %
lams=0.810;    % central wavelength
lami=0.810;    % central wavelengths
FWHM_waist_fcm=60; % collection mode waist
ang_extg=16;  % external emission angle (degrees)

%%% Coincidence rate and joins spectrum %%%%%
[joint_amplitude,Rc,K]=FC_JSA(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,ang_extg,deff,Pav,L,z0,NN,Nz,lams_max,lams_min,lami_max,lami_min);

%% single detection rate %%%%
[jsa_Ns,Rs]= FC_singleRate(lamp,lams,lami,FWHM_spec,FWHM_waist,FWHM_waist_fcm,ang_extg,deff,Pav,L,z0,NN,Nz,lams_max,lams_min,lami_max,lami_min);

%%% heralding effciency %%%

eta = Rc/Rs



lams=1e3.*(2*pi*3e14)./linspace((2*pi*3e14)/lams_max,(2*pi*3e14)/lams_min,NN);
lami=1e3.*(2*pi*3e14)./linspace((2*pi*3e14)/lami_max,(2*pi*3e14)/lami_min,NN);

colormap gray
cmap = colormap;
cmap = flipud(cmap);

figure(1)
pcolor(lams,lami,abs(joint_amplitude).^2./max(max(abs(joint_amplitude).^2))),shading interp
colormap(cmap)
set(gcf,'Color',[1,1,1])
set(gca,'TickDir','out','TickLength',[0.015 0.015])
set(gca,'FontSize',18,'FontName','arial')
box on
axis square
xlim([lams_min*1e3 lams_max*1e3 ])
ylim([lami_min*1e3  lami_max*1e3 ])
xlabel('wavelength of signal (nm)')
ylabel('wavelength of idler (nm)')
axis on


figure(2)
pcolor(lams,lami,jsa_Ns./max(max(jsa_Ns))),shading interp
colormap(cmap)
set(gcf,'Color',[1,1,1])
set(gca,'TickDir','out','TickLength',[0.015 0.015])
set(gca,'FontSize',18,'FontName','arial')
box on
axis square
xlim([lams_min*1e3 lams_max*1e3 ])
ylim([lami_min*1e3  lami_max*1e3 ])
xlabel('wavelength of signal (nm)')
ylabel('wavelength of idler (nm)')
axis on




toc
