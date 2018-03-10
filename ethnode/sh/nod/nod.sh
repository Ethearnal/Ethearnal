#!/usr/bin/env bash
#!/usr/bin/env bash
pro=$1
cdn_to_use=$2
udp_boot_to=$3
#python ert.py -l 0.0.0.0:4567 -u 0.0.0.0:34567 -d ~/nod_profile_p -i -f eth0 -s 188.166.154.183:45678 -p 188.166.154.183:5678
python ert.py -i -f eth0 -l 0.0.0.0:4567 -u 0.0.0.0:34567 -d ~/nod_profile_${pro} -p ${cdn_to_use} -s ${udp_boot_to}


