#!/usr/bin/env bash
$1
profile_dir=$1
python ert.py -f eth0 -u 0.0.0.0:34567 -l 0.0.0.0:4567 -i -d ~/nod_profile_${profile_dir}
