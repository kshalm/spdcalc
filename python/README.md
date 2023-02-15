# SPDCalc

Python bindings for [SPDCalc](https://github.com/kshalm/spdcalc), the Spontaneous Parametric Downconversion Calculator

## Usage

```bash
pip3 install spdcalc
```

```python
from spdcalc import *

# your code here...
```

### Running spdcalc on Windows

Install Microsoft C++ build tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/
Install Rust from https://www.rust-lang.org/tools/install and then use the Rustup tool to install using default settings. 
Install GitHub Desktop and clone the spdcalc repository. 
Install the latest version of Anaconda, as well as Python 3.7.9.

Open Windows power shell, accessible from the Anaconda Navigator as Powershell Prompt, and navigate to the python folder within spdcalc.

```
cargo build
cargo install cargo-make
pip install pipenv
rustup toolchain add nightly --profile minimal
cargo make build
cd target
cd wheels
pip install pyspdcalc-0.1.0-cp38-none-win_amd64.whl
python
import spdcalc
```

## Documentation

Coming soon...

## Examples

See the `examples/` directory for example calculations.
