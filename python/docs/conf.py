# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))
import toml
import sphinx_rtd_theme
import shutil
import datetime
import configparser
import inspect
import os
import sys
import semantic_version

# -- Project information -----------------------------------------------------

project = 'SPDCalc'
copyright = '2020, Jasper Palfree, Krister Shalm'
author = 'Jasper Palfree, Krister Shalm'

cargo_cfg = toml.load(open('../Cargo.toml'))
# The parsed semantic version
semver = semantic_version.Version.coerce(cargo_cfg["package"]["version"])
# The full version, including alpha/beta/rc tags
# The short X.Y.Z version
version = "{v.major}.{v.minor}.{v.patch}".format(v=semver)
# The full version, including alpha/beta/rc tags
release = str(semver)


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinx_rtd_theme",
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    # "sphinx.ext.doctest",
    "sphinx.ext.intersphinx",
    "sphinx.ext.napoleon",
    # "sphinx.ext.todo",
    # "sphinx.ext.coverage",
    "sphinx.ext.mathjax",
    # "sphinx.ext.ifconfig",
    "sphinx.ext.viewcode",
    "sphinx.ext.githubpages",
    "nbsphinx",
    "recommonmark"
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store', '**/.ipynb_checkpoints']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

html_extra_path = ['examples/iframe_figures']

source_suffix = {
    '.rst': 'restructuredtext',
    '.txt': 'markdown',
    '.md': 'markdown',
}

# -- Options for napoleon extension ------------------------------------------

napoleon_include_init_with_doc = True
napoleon_include_special_with_doc = True
napoleon_include_private_with_doc = True
napoleon_use_admonition_for_examples = True
napoleon_use_admonition_for_notes = True
napoleon_use_admonition_for_references = True
napoleon_use_rtype = False

# -- Options for autodoc extension -------------------------------------------

autoclass_content = "class"

# -- Options for intersphinx extension ---------------------------------------

# Example configuration for intersphinx: refer to the Python standard library.
intersphinx_mapping = {
    "python": ("https://docs.python.org/3/", None),
}
