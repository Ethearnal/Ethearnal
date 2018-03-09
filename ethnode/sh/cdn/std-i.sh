#!/usr/bin/env bash
echo " < $1 > cdn_profile < $2 > files dir"

python cdn.py -f -d ~/cdn_files_$2 -p ~/cdn_profile_$1 -f eth0 -l 0.0.0.0:5678 -c http://159.65.56.140:8080/friendface.json -i
