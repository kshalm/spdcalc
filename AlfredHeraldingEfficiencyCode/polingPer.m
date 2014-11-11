function LAM=polingPer(lamp,lams,as)

options = optimset('Display','on','TolFun',1e-10); 
optnew = optimset(options,'TolX',1e-10);

LAM = fzero(@(LAM)DK(lamp,lams,LAM),as,optnew) ;
