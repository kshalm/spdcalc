function [A1,A2,A3,A4,A5,A6,A7,A8,A9,A10]=auxintRc(Xi,L,ks,ki,kp,Wx,Wy,Wfs,Wfi,Phis,Phii,Psis,Psii,Rho,hs,hi,z0,LAM)


A1= 1i.*0.25.*(-(L./kp) + L./ks).*Xi + 1i.*0.25.*(-(L./ks) + 1i.*Wx.^2 + (2.*z0)./kp + 1i.*Wfs.^2.*Phis);

A2= 1i.*0.25.*(-(L./ks) + 1i.*Wfs.^2 + 1i.*Wy.^2 + (2.*z0)./kp) + 1i.*0.25.*(-(L./kp) + L./ks).*Xi;

A3= 1i.*0.25.*(L./ki - L./kp).*Xi + 1i.*0.25.*(-(L./ki) + 1i.*Wx.^2 + (2.*z0)./kp + 1i.*Wfi.^2.*Phii);

A4= 1i.*0.25.*(-(L./ki) + 1i.*Wfi.^2 + 1i.*Wy.^2 + (2.*z0)./kp) + 1i.*0.25.*(L./ki - L./kp).*Xi;

A5= 1i.*0.25.*(4.*hs - 1i.*2.*Wfs.^2.*Phis.*Psis);

A6= 1i.*0.5.*L.*Rho + 1i.*0.5.*L.*Xi.*Rho;

A7= 1i.*0.25.*(4.*hi - 1i.*2.*Wfi.^2.*Phii.*Psii);

A8= 1i.*0.25.*(1i.*2.*Wx.^2 + (4.*z0)./kp) - (1i.*0.5.*L.*Xi)./kp;

A9= 1i.*0.25.*(1i.*2.*Wy.^2 + (4.*z0)./kp) - (1i.*0.5.*L.*Xi)./kp;

A10= 1i.*0.25.*(-2.*ki.*L + 2.*kp.*L - 2.*ks.*L + (4.*L.*pi)./LAM).*Xi + ...
     1i.*0.25.*(2.*ki.*L + 2.*kp.*L + 2.*ks.*L - (4.*L.*pi)./LAM + 1i.*Wfi.^2.*Phii.*Psii.^2 +...
     1i.*Wfs.^2.*Phis.*Psis.^2);