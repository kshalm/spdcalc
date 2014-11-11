function HH=DK(lamp,lams,LAM)

kte=2*pi*3e14;


omi=kte./lamp-kte./lams;
lami=kte./omi;

np=IndxRefr_y(lamp);
ns=IndxRefr_z(lams);
ni=IndxRefr_y(lami);


kp=np.*(2*pi)./lamp;
ks=ns.*(2*pi)./lams;
ki=ni.*(2*pi)./lami;

HH=kp-ks-ki-2*pi/LAM;