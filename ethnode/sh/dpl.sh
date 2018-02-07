#!/usr/bin/env bash

#!/bin/bash
FILES=/eth/gihub/Ethearnal/ethnode/data_demo/json_data/*.json
for f in $FILES
do
  echo "Processing $f file..."
  # take action on each file. $f store current file name
  python ert.py -n -i -l 127.0.0.1:2001 -u 127.0.0.1:3001 -j $f  -d data_demo/$1_p -s 127.0.0.1:45678
done