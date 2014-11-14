function z=SchmidtK(Z)

K1=Z*Z';
K2=Z'*Z;


[T1,E1]=eig(K1);
[T2,E2]=eig(K2);

num=sqrt(numel(E1));

for i=1:num
   j=num-(i-1);
   eigval1(i)=E1(j,j);
   eigval2(i)=E2(j,j);
end

numeigval=1:1:num;
sumeigval1=sum(eigval1);
sumeigval2=sum(eigval2);


invK=0;
for i=1:num
   invK=invK+(E1(i,i)/sumeigval1)^2;
end

K=1/invK;

z=K;


