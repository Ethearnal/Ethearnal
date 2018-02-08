#!/usr/bin/env bash

#!/bin/bash
FILES=/eth/gihub/Ethearnal/ethnode/data_demo/json_data/*.json
PROFILE_DATA=/eth/gihub/Ethearnal/ethnode/data_demo/profile_data/
for f in $FILES
do
  echo "Processing $f file..."
  name=$(basename "$f")
  # name=${name} | tr . _
  echo ${name}
  # take action on each file. $f store current file name
  python ert.py -n -i -l 127.0.0.1:2001 -u 127.0.0.1:3001 -j $f  -d ${PROFILE_DATA}/${name}_p -s 127.0.0.1:45678 &>/dev/null
done