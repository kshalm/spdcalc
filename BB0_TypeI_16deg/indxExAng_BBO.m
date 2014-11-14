function ne_theta = indxExAng_BBO(omega,ang)

%%ang debe estar en grados


ne=indxEx_BBO(omega);
no=indxOr_BBO(omega);


ne_theta= 1./ sqrt( cos(ang).^2./no.^2 +  sin(ang).^2./ne.^2 );

