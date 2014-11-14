function rho=walkoff(omega,ang)

ne=indxEx_BBO(omega);
no=indxOr_BBO(omega);

ne_theta = indxExAng_BBO(omega,ang);

rho=((no.^2-ne.^2)./(no.^2.*ne.^2)).*sin(ang).*cos(ang).*(ne_theta).^2;



% nep = ((2.*cos(ang).*sin(ang))./...
%           ne - ...
%          (2.*cos(ang).*sin(ang))./no...
%          )./...
%        (2.*(cos(ang).^2./no + ...
%             sin(ang).^2./ne).^...
%           1.5);



