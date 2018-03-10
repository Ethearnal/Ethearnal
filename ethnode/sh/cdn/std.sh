#!/usr/bin/env bash

pro=$1
fls=$2
python cdn.py -d ~/cdn_files_${fls} -p ~/cdn_profile_${pro} -f eth0 -l 0.0.0.0:5678 -i
