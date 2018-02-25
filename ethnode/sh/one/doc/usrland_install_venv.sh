#!/bin/bash
set -x
cd ~/doc
virtualenv -p python3 ert3 
source ert3/bin/activate
pip install -r ./requirements_linux.txt
deactivate
set +x

