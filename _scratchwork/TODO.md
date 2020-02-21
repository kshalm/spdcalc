Ask krister about

http://spdcalc.org/#lambda_p=%2B7.750000000000001e-7&lambda_s=%2B0.0000012000000000000002&lambda_i=%2B0.000002188235294117647&type=~Type%202%3A%20%20%20e%20-%3E%20e%20%2B%20o&theta=%2B1.5707963267948966&phi=%2B0&theta_s=%2B0&theta_i=%2B0&theta_s_e=%2B0&theta_i_e=%2B0&phi_s=%2B0&phi_i=%2B3.141592653589793&L=%2B0.002&W=%2B0.00009999999999999999&p_bw=%2B5.35e-9&walkoff_p=%2B0&W_sx=%2B0.00009999999999999999&W_sy=%2B0.00009999999999999999&W_ix=%2B0.00009999999999999999&W_iy=%2B0.00009999999999999999&phase=!false&brute_force=!false&brute_dim=%2B50&autocalctheta=!false&autocalcpp=!true&poling_period=%2B0.00016390550506143825&poling_sign=%2B-1&calc_apodization=!false&apodization=%2B31&apodization_FWHM=%2B0.0015999999999999999&use_guassian_approx=!false&crystal=~KTP-3&temp=%2B20&enable_pp=!true&calcfibercoupling=!true&singles=!false&autocalfocus=!true&z0s=%2B-0.0005601199668726622&deff=%2B1e-12&Pav=%2B0.001



ToDO

message about period poling and autocalc theta both enabled warning

message about autocalc theta enabled and modifying other parameters

nice to have: generic graphs

integration steps depend on sinc lobe width vs grid size

update comlink-loader to expose worker so it can be terminated

= optimization =

return heralding results as arrays

try using complex.finv() in singles calc

= Index of refraction data =

plot vs wavelengths
values for current wavelength

= autocalc waist position =

maybe we don't need optimization at all,
just set it to L/2 in free space and then divide by index of refraction for
whichever beam.

= freeze state =
lock certain plots in current state so parameter changes don't affect it
keep track of parameters used to compute current state
ability to label that module
unlocked => no refresh button
locked => has refresh button

= group modules =
modules can be loaded with several plots, larger card
around certain plots that are linked

= for waist stuff =
verify lambda/n >> 20 ??


-[ ] lock button copy spd parameters to local

-[ ] plot legend selection forgets upon refresh
