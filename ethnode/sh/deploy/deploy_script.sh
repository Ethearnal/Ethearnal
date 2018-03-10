#!/usr/bin/env bash
#!/usr/bin/env bash

user=$1
host=$2
script=$3
stay=$4
# exit_then='echo $0'
exit_arg=$4
script_base=$(basename ${script})
setup_dir="setup"
script_dir="${setup_dir}/sh"


if [ -z ${user} ]; then echo "arg 1 host is unset" && exit 1; else echo "<user> : '${user}'"; fi

if [ -z ${host} ]; then echo "arg 2 host is unset" && exit 1; else echo "<host> : '${host}'"; fi

if [ -z ${script} ]; then echo "arg 3 script is unset" && exit 1; else echo "<script> : '${script}'"; fi

if [ -z ${stay} ]; then stay='-n'; fi
echo "<stay> : ${stay}"
echo "ping ${host} ..."

ping -c1 ${host}

echo "--- local script contents ---"
cat ${script}
echo
echo "-----------------------------"
echo ""
if [ ${stay} == '-y' ]; then
    echo "will stay after on remote ${stay}";
else
    echo "will not stay on remote ${stay}";
fi

read -p " Are you sure to deploy y/n? " -n 1 -r

echo    # (optional) move to a new line

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
    # handle exits from shell or function but don't exit interactive shell
fi

ssh ${user}@${host} "mkdir -p ${script_dir}"

echo "copy ${script}"

remote_script_dir="/home/${user}/${script_dir}"
remote_script="${remote_script_dir}/${script_base}"

echo "--- remote location --- "
echo ${remote_script}
echo " -----------------------"
ssh ${user}@${host} "chmod 700 ${remote_script}"
scp ${script} ${user}@${host}:${remote_script}

if [ ${stay} == -y ]; then
    ssh -t ${user}@${host} "${remote_script}; bash -l";
else
    ssh -t ${user}@${host} "${remote_script}";
fi

# set -x