#!/bin/bash
set -x
apt-get update -y
apt-get upgrade -y
apt-get install git -y
apt-get install python3-pip -y
apt-get install python3-dev -y
apt-get install nginx -y
set +x

