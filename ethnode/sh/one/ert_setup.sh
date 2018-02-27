#!/usr/bin/env bash
set -x
ok_code=0
cd ~/
git clone https://github.com/Ethearnal/Ethearnal.git
cd ~/doc
virtualenv -p python3 ert3
source ~/doc/ert3/bin/activate
pip install -r ./requirements.ubuntu.16.04.4.txt
pwd
sleep 3
cd ~/Ethearnal/ethnode
pwd
sleep 3
git checkout mixin/develop
git pull
sleep 1
cd ~/Ethearnal/ethnode
pwd
sleep 3
pwd
source ~/doc/ert3/bin/activate
#
python3 /home/one/Ethearnal/ethnode/ert.py -t -f lo
if [ $? -eq ${ok_code} ];then echo "ert.py test OK"; else echo "ERT FAIL"; fi
python3 /home/one/Ethearnal/ethnode/cdn.py -t -f lo
if [ $? -eq ${ok_code} ];then echo "cdn.py test OK"; else echo "CDN FAIL"; fi
set +x