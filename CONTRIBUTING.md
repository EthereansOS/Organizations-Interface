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

* Solidity portions of the codebase adhere follow the official [Solidity Styleguide]

### JavaScript

### Python

* Python portions of the codebase follow standard PEP8 best practices.
* Python code must be formatted using the Black formatter using the provided settings.

## Documentation

New addition to the codebase must be fully documented.

- JavaScript portions of the code should be annotated using JSDoc style docstrings.
- Solidity portions of the code should be fully annotated using [NatSpec] and [Solidity Domain for Sphinx].

Documentation is generated using Sphinx and reStructuredText, following the example set by Solidity. For a more comprehensive
description of the documentation process see [Write the Docs!]

To locally generate the documentation either use:

```console
tox -e docs
```

Or DIY:

```console
virtualenv .venv
source .venv/bin/activate
pip install -r docs/requirements.txt
cd docs
make html
```

---

[Solidity Styleguide]: https://solidity.readthedocs.io/en/v0.7.0/style-guide.html
[NatSpec]: https://solidity.readthedocs.io/en/v0.7.0/style-guide.html#natspec
[Write the Docs!]: docs/source/write_the_docs.rst
[Solidity Domain for Sphinx]: https://solidity-domain-for-sphinx.readthedocs.io/en/latest/formatting.html
