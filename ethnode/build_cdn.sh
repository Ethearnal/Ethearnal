#!/bin/bash

# todo different build targets
cwd=`pwd`
target_package="cdn_linux_amd64.tar.gz"

pyinstaller ./cdn.py
pyinstaller ./ert.py
sleep 3

cp -r ./webdoc ./dist/ert/
cp -r ./webui ./dist/ert/
cp -r ./apidef ./dist/ert/
cp -r ./cdnapidef ./dist/ert/

mkdir -p ./packages
cd ./dist
cp -r ./ert/* ./cdn/
tar zcvf ${target_package} ./cdn
cp ${target_package} ../packages/
cd ${cwd}

