# Contributing guidelines

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Coding Style](#coding-style)
  - [Solidity](#solidity)
  - [JavaScript](#javascript)
  - [Python](#python)
- [Documentation](#documentation)

## Coding Style

### Solidity

- Solidity portions of the codebase adhere follow the official [Solidity Styleguide]
- `.sol` filename should be PascalCase

### JavaScript

### Python

- Python portions of the codebase follow standard PEP8 best practices.
- Python code must be formatted using the Black formatter using the provided settings.

## Documentation

**NOTE:** Currently the documentation pipeline is composed by a custom Python Parser that output `md`
files and renders them via `mkdocs`. We are however working on a more comprehensive solution built
around Sphinx and reStructuredText.

New addition to the codebase must be fully documented.

- JavaScript portions of the code should be annotated using JSDoc style docstrings.
- Solidity portions of the code should be fully annotated according to [NatSpec] standards.

<!--
Documentation is generated using Sphinx and reStructuredText, following the example set by Solidity. For a more comprehensive
description of the documentation process see [Write the Docs!]

To locally generate the documentation:

```console
virtualenv .venv
source .venv/bin/activate
pip install -r docs/requirements.txt
cd docs
make html
``` -->

---

[Solidity Styleguide]: https://solidity.readthedocs.io/en/v0.7.0/style-guide.html
[NatSpec]: https://solidity.readthedocs.io/en/v0.7.0/style-guide.html#natspec
[Write the Docs!]: docs/source/write_the_docs.rst
[Solidity Domain for Sphinx]: https://solidity-domain-for-sphinx.readthedocs.io/en/latest/formatting.html
