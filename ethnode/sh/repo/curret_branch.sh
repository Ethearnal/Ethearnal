#!/usr/bin/env bash
set -x
curr_branch=`git branch | grep "*"`
curr_branch=${curr_branch:2}
export GIT_ACTIVE_BRANCH=${curr_branch}
set +x