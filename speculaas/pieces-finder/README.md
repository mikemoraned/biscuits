# pieces-finder

This is the backend which serves up pieces to the pieces-view front-end.

## Pre-requisistes

- [pyenv](https://github.com/pyenv/pyenv)
- [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv)
- [pip-tools](https://github.com/jazzband/pip-tools)

## Development

### Setup environment

    pyenv install
    pyenv virtualenv pieces-finder # creates the venv
    pyenv activate pieces-finder
    pip install pip-tools

### Install dependencies

    pip-sync

### Update dependencies

Add the dependency to `requirements.in` and then run:

    pip-compile requirements.in # will create a requirements.txt which you must now check in
