#!/bin/bash

python ert.py -n -i -l 127.0.0.1:2001 -u 127.0.0.1:3001 -d data_demo/p_$1_p -s 127.0.0.1:45678
