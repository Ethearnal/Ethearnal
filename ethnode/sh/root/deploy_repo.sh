#!/usr/bin/env bash
curr_branch=`git branch | grep "*"`
curr_branch=${curr_branch:2}
export GIT_ACTIVE_BRANCH=${curr_branch}
host=$1
user=$2
script="./clone_repo.sh"

./deploy_user_script.sh