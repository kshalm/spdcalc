from spdcalc import bindings
import plotly.graph_objects as go
import numpy as np

# The functions are all accessed from this `spdc` object
spdc = bindings.spdcalc()

def get_config():
    with open("./settings.yaml", 'r') as f:
        config = f.read()
    return spdc.config_from_yaml(config)

def print_stats(cfg):
    wavelengths = spdc.optimum_range(cfg, 50)
    print("schmidt number: {}".format(spdc.schmidt_number(cfg, wavelengths, None)))
    print("counts: {}".format(spdc.counts_coincidences(cfg, wavelengths, None)))
    print("counts singles signal: {}".format(spdc.counts_singles_signal(cfg, wavelengths, None)))
    print("counts singles idler: {}".format(spdc.counts_singles_idler(cfg, wavelengths, None)))
    print("hom visibility: {}".format(spdc.hom_visibility(cfg, wavelengths, None)))
    print("hom two source visibilities: {}".format(spdc.hom_two_source_visibilities(cfg, wavelengths, None)))
    print("efficiencies: {}".format(spdc.efficiencies(cfg, wavelengths, None)))

def plot_jsi(cfg):
    wavelengths = spdc.optimum_range(cfg, 100)

    x = np.linspace(wavelengths.value.x[0], wavelengths.value.x[1], wavelengths.value.x[2])
    y = np.linspace(wavelengths.value.y[0], wavelengths.value.y[1], wavelengths.value.y[2])
    jsi = spdc.jsi_normalized_range(cfg, wavelengths, None)
    jsi = np.reshape(np.array(jsi), (wavelengths.value.x[2], wavelengths.value.y[2]))

    # Plot the JSI with plotly
    fig = go.Figure(data=go.Heatmap(
        z=jsi,
        x=x,
        y=y
        )
    )

    fig.update_layout(
        title='JSI Plot'
    )

    fig.show()
