function ny=IndxRefr_y(lambda)

if lambda<1.2
    ny=sqrt(2.14559+ (0.87629.*lambda.^2)./(lambda.^2-0.0485)-0.01173.*lambda.^2);
else
    ny=sqrt(2.0993+ (0.922683.*lambda.^2)./(lambda.^2-0.0467695)-0.0138408.*lambda.^2);
end


