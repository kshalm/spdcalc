{{=it.plot.title}}
Crystal: {{=it.meta.crystal}}
Pump Wavelength: {{=it.meta.lambda_p}}
Signal Wavelength: {{=it.meta.lambda_s}}
Idler Wavelength: {{=it.meta.lambda_i}}
PM Type: {{= this.PhaseMatch.PMTypes[ it.meta.type ] }}
Theta: {{=it.meta.theta}}
Phi: {{=it.meta.phi}}
Theta Signal: {{=it.meta.theta_s}}
Theta Idler: {{=it.meta.theta_i}}
Phi Signal: {{=it.meta.phi_s}}
Phi Idler: {{=it.meta.phi_i}}
Poling Period: {{=it.meta.poling_period}}
L: {{=it.meta.L}}
W: {{=it.meta.W}}
Pump Bandwidth: {{=it.meta.p_bw}}
Phase: {{=it.meta.phase}}
Apodization: {{=it.meta.apodization}}
Apodization FWHM: {{=it.meta.apodization_FWHM}}

{{=it.plot.x.label}}, {{=it.plot.y.label}}
{{~it.plot.data :val:idx}}{{~val :coord:i}}{{=coord}}{{? i < val.length - 1 }}, {{?}}{{~}}
{{~}}

