#!/usr/bin/env bash
cd /home/one/Ethearnal/ethnode
killall python
pwd
git pull
rm -rf ~/cdn_*
/home/one/Ethearnal/ethnode/sh/cdn/std-i.sh
