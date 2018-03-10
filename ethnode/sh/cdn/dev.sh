#!/usr/bin/env bash
cd ~/Ethearnal/ethnode
killall python
git pull
rm -rf ~/cdn_*
./sh/cdn/std-i.sh
