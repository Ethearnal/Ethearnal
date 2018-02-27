#!/usr/bin/env bash

host=$1
script=$2

if [ -z ${host} ]; then echo "arg 1 host is unset" && exit 1; else echo "var is set to '${host}'"; fi
if [ -z ${script} ]; then echo "arg 2 script is unset" && exit 1; else echo "var is set to '${script}'"; fi
echo "will deploy ${script} system setup at host ${host}"
ping -c3 ${host}
cat ${script}
read -p "Are you to deploy sure? " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi
echo "copy ${script}"
scp ${script} root@$1:~/
echo "ssh execute ${script}"
ssh -t root@${host} "./${script}; bash -l"