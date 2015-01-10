function [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11]=auxintRc(Xi,L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0);

% Wfi = 50.95E-6;
% Wfs = Wfi;
A1 = (0.25.*1i.*(ks.*(2.*z0 - L.*Xi) + ...
      kp.*(L.*(-1 + Xi) + ...
      1i.*ks.*(Wx.^2 + Wfs.^2.*Phis))))./(kp.*ks);

A2 = 1i.*hs + (Wfs.^2.*Phis.*Psis)./2;

A3 = (0.25.*1i.*(kp.*(1i.*ks.*(Wfs.^2 + Wy.^2) + ...
             L.*(-1 + Xi)) + ks.*(2.*z0 - L.*Xi)))./(kp.*ks);
         
A4 = 0.5.*1i.*L.*(1 + Xi).*Rho  ;


A5 = (0.25.*1i.*(ki.*(2.*z0 - L.*Xi) + ...
           kp.*(L.*(-1 + Xi) + ...
              1i.*ki.*(Wx.^2 + Wfi.^2.*Phii))))./(ki.*kp);

A6 = 1i.*hi + (Wfi.^2.*Phii.*Psii)./2; 

A7 = (0.25.*1i.*(kp.*(1i.*ki.*(Wfi.^2 + Wy.^2) + ...
             L.*(-1 + Xi)) + ki.*(2.*z0 - L.*Xi)))./(ki.*kp);
         
         
A8 = A4;

A9 = -(kp.*Wx.^2 - 2.*1i.*z0 + 1i.*L.*Xi)./(2.*kp);

A10 = -(kp.*Wy.^2 - 2.*1i.*z0 + 1i.*L.*Xi)./(2.*kp);

A11=  (2.*1i.*L.*(ki + kp + ks - (ki - kp + ks).*Xi) - ...
       Wfi.^2.*Phii.*Psii.^2 - Wfs.^2.*Phis.*Psis.^2)./4;
% Wfi
% Wfi.^2
% Phii
% Psii
% ks
% hh = A11
   