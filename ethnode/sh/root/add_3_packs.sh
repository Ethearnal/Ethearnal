#!/bin/bash
set -x
apt-get update
apt-get upgrade
apt-get install git -y
apt-get install python3-pip
apt-get install python3-dev
apt-get install nginx
set +x

