#!/usr/bin/env bash
set -x

# major locales

locale-gen en_US.UTF-8
locale-gen bg_BG.UTF-8
locale-gen ru_RU.UTF-8
update-locale

# sys wide packs

apt-get update -y
apt-get upgrade -y
apt-get install git -y
apt-get install python3-pip -y
apt-get install python3-dev -y
apt-get install nginx -y
apt-get install chrony -y

# pip3

pip3 install --upgrade pip
pip3 install virtualenv

# default user

echo "setting user one and add copy key"
adduser --disabled-password --gecos "" one
mkdir /home/one/.ssh
chown one: /home/one/.ssh
chmod 700 /home/one/.ssh
cp /root/.ssh/authorized_keys /home/one/.ssh
chown one: /home/one/.ssh/authorized_keys
chmod 600 /home/one/.ssh/authorized_keys
echo "setting user one done"

set +x
