#!/usr/bin/env bash

# e.g target= user@host one@lon ( keys have to be auth )
target=$1

./build_cdn.sh
ssh ${target} 'cd ~;pwd;killall cdn;ls -l;rm -rf ./cnd;';
scp dist/cdn_linux_amd64.tar.gz ${target}:~/
ssh ${target} 'tar -zxvf ./cdn_linux_amd64.tar.gz;cd cdn;./cdn -f eth0'


