#!/usr/bin/env bash
#!/usr/bin/env bash

host=$1
script=$2

if [ -z ${host} ]; then echo "arg 1 host is unset" && exit 1; else echo "var is set to '${host}'"; fi
if [ -z ${script} ]; then echo "arg 2 script is unset" && exit 1; else echo "var is set to '${script}'"; fi
echo "will deploy ${script} system setup at host ${host}"
ping -c3 ${host}
cat ${script}
read -p "Are you sure to deploy? " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi
echo "copy ${script}"
scp ${script} one@$1:~/
echo "ssh execute ${script}"
ssh one@${host} "chmod 700 ~/${script}"
ssh one@${host} "mkdir ~/doc"
scp requirements.ubuntu.16.04.4.txt one@${host}:~/doc/
ssh -t one@${host} "./${script}; bash -l"
