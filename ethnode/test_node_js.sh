#!/bin/bash

python ert.py -n -i -l 127.0.0.1:4001 -u 127.0.0.1:5001 -j data_demo/live_json/$1.json -d data_demo/$1_p -s 127.0.0.1:45678
