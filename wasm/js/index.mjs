// index.js

import { bindings } from "./package/src/index.js"
import { Spdc } from "./package/src/bindings/spdcalc/spdcalc.js"

async function main() {
  const spdcalc = await bindings.spdcalc()
  const spdc = Spdc.fromConfig(spdcalc, {
    "crystal": {
      "name": "BBO_1",
      "pm_type": "e->eo",
      "phi_deg": 0,
      "theta_deg": 0,
      "length_um": 2000,
      "temperature_c": 20
    },
    "pump": {
      "wavelength_nm": 775,
      "waist_um": 100,
      "bandwidth_nm": 5.35,
      "average_power_mw": 1
    },
    "signal": {
      "wavelength_nm": 1550,
      "phi_deg": 0,
      "theta_external_deg": 0,
      "waist_um": 100,
      "waist_position_um": "auto"
    },
    "idler": "auto",
    "deff_pm_per_volt": 1
  })

}

main()