#!/bin/bash

# todo different build targets
cwd=`pwd`
target_package="ethnode_0.0.1_linux_amd64.tar.gz"

pyinstaller ./ethnode.py
sleep 3
cp -r ./webdoc ./dist/ethnode/
mkdir -p ./packages
cd ./dist
tar zcvf ${target_package} ./ethnode
cp ${target_package} ../packages/
cd ${cwd}
