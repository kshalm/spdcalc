// index.js

import { bindings } from "./package/src/index.js"

async function main() {
  const spdcalc = await bindings.spdcalc()
  console.log("jsi", spdcalc.test())
}

main()