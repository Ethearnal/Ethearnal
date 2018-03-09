#!/usr/bin/env bash
# $1 cdn_profiliei nstance
# $2 cdn file dir instance

python cdn.py -f -d ~/cdn_files_$2 -p ~/cdn_profile_$1 eth0 -l 0.0.0.0:5678 -c http://159.65.56.140:8080/friendface.json -i
