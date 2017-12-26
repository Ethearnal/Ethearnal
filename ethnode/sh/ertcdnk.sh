#!/bin/bash

# ertnode_home=""
# ert_nod_venv=""

# alias ertnod='cd ertnode_home&& workon ertnode_dev'
# alias ertnodk='cd ertnode_home && workon ertnode_dev && ./sh/ert


k=$1
s=$2

ihtp="-l 0.0.0.0:200${k}"
iudp="-u 0.0.0.0:300${k}"
seed="-s 127.0.0.1:300${s}"
data="-p p${k}_cdn_profile"
file="-d p${k}_cdn_profile_files"
cmd="cdn.py -i -n ${data} ${file} ${ihtp} ${iudp} ${seed}"

echo ${cmd}
python $cmd