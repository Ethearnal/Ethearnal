#!/bin/bash

# todo different build targets
cwd=`pwd`
target_package="cdn_linux_amd64.tar.gz"

pyinstaller ./cdn.py

sleep 3

cp -r ./apidef ./dist/cdn/
cp -r ./cdnapidef ./dist/cdn/

mkdir -p ./packages

cd ./dist
cp -r ./ert/* ./cdn/
tar zcvf ${target_package} ./cdn
cp ${target_package} ../packages/
cd ${cwd}

