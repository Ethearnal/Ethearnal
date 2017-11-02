#!/bin/bash

# ertnode_home=""
# ert_nod_venv=""

# alias ertnod='cd ertnode_home&& workon ertnode_dev'
# alias ertnodk='cd ertnode_home && workon ertnode_dev && ./sh/ert


k=$1
s=$2

ihtp="-l 0.0.0.0:200${k}"
iudp="-u 0.0.0.0:300${k}"
seed="-s 0.0.0.0:300${s}"
data="-d p${k}_profile"

cmd="ert.py -i ${data} ${ihtp} ${iudp} ${seed}"

echo ${cmd}
python $cmd