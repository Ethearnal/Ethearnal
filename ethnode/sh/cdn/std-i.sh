#!/usr/bin/env bash

pro=$1
fls=$2
echo "< ~/cdn_files_${fls}> --> cdn_profile /n < ~/cdn_profile_${pro} > --> files dir"
python cdn.py -d ~/cdn_files_${fls} -p ~/cdn_profile_${pro} -f eth0 -l 0.0.0.0:5678 -i
