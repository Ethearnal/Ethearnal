#!/usr/bin/env bash
proc_num=$1
strace -e trace=write -s1000 -fp ${proc_num} 2>&1 \
| grep --line-buffered -o '".\+[^"]"' \
| grep --line-buffered -o '[^"]\+[^"]' \
| while read -r line; do
  printf "%b" $line;
done
