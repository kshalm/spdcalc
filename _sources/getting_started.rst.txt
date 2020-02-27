Getting Started
===============

SPDCalc is written using the RUST programming language. This library provides
python bindings for the rust code. Binary wheels are available for
some architectures but if one is not available you can try building it
yourself.

If a binary wheel is available, you can install SPDCalc using pip:

.. code-block:: bash

    $ pip install spdcalc

If your architecture does not have a wheel, you will need to install
rust nightly. And then try running pip install with the nightly rust toolchain.

.. code-block:: bash

    $ rustup run nightly pip install spdcalc
