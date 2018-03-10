#!/usr/bin/env bash
set -x

pwd
pro=$1
fls=$2

echo "< ~/cdn_files_${fls}> --> cdn_profile /n < ~/cdn_profile_${pro} > --> files dir"
set -x
#python cdn.py -d ~/cdn_files_${fls} -p ~/cdn_profile_${pro} -f enp5s0 -l 0.0.0.0:5678 -c http://159.65.56.140:8080/friendface.json -i
