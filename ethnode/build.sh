#!/bin/bash

# todo different build targets
cwd=`pwd`
target_package="ert_0.0.1_linux_amd64.tar.gz"

pyinstaller ./ert.py
sleep 3
cp -r ./webdoc ./dist/ert/
mkdir -p ./packages
cd ./dist
tar zcvf ${target_package} ./ert
cp ${target_package} ../packages/
cd ${cwd}
