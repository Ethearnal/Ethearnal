#!/usr/bin/env bash
#!/usr/bin/env bash
pro=$1
cdn_to_use=$2
python ert.py -f eth0 -l 0.0.0.0:4567 -u 0.0.0.0:34567 -d ~/nod_profile_${pro} -p ${cdn_to_use} -i


