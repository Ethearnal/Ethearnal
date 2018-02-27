#!/bin/bash
set -x
echo "setting user one and add copy key"
adduser --disabled-password --gecos "" one
mkdir /home/one/.ssh
chown one: /home/one/.ssh
chmod 700 /home/one/.ssh
cp /root/.ssh/authorized_keys /home/one/.ssh
chown one: /home/one/.ssh/authorized_keys 
chmod 600 /home/one/.ssh/authorized_keys 
echo "setting user one done"
sleep 1
set +x


