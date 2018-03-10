#!/usr/bin/env bash

# this_base=$(dirname "$0")
# cd ${this_base}
# pwd

# ssh -t {user}@${host} "~/${script}; bash -l"
user=$1
host=$2
script=$3
# def_user="one"
script_base=$(basename ${script})
echo "SCR BASE ${script_base}"

if [ -z ${user} ]; then
    echo "arg 1 user unset" && exit 1;
else
    echo "var is set to '${user}'";
fi

if [ -z ${host} ]; then
    echo "arg 2 host is unset" && exit 1;
else
    echo "var is host set to '${host}'";
fi

if [ -z ${script} ]; then
    echo "arg 3 script is unset" && exit 1;
else
    echo "var is script set to '${script}'";
fi

user_host="${user}@${host}"
# sh_args1="-t ${user}@${host} 'source ./${script_base}; bash -l'"
sh_args1="${user_host} 'source /home/${user}/${script_base}'"
scp_args0="${script} ${user}@${host}:/home/${user}/'"

pint ${host} -c 3

echo "scp ${scp_args0}"
# echo "ssh ${sh_args1}"
# echo "ssh ${sh_args2}"

scp ${scp_args0}
ssh ${sh_args1}
#ssh ${sh_args2}
#ssh ${user_host} "ls -l ./"
#ssh ${sh_cmd2}

# scp ${user_script} ${def_user}@${host}:~/
#ssh -t ${def_user}@${host} "chmod 700 ~/${user_script_base};"
# ssh -t ${def_user}@${host} "~/${user_script_base}; bash -l"
# set +x