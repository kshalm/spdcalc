function z = thcut(om,th)


% syms thrad;

%c=3.*10^14;

thrad=(pi/180).*th;

% lam=2.*pi.*c./om;



nep=indxEx_BBO(om.*2);
nop=indxOr_BBO(om.*2);
ns=indxOr_BBO(om);



term1=(nep.^2-ns.^2.*cos(thrad).^2).*nop.^2;
term2=(nep^2-nop^2).*ns^2*cos(thrad).^2;



z=acos( (term1./term2).^.5 ).*(180./pi);


