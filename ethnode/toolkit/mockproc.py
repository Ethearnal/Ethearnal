#!/usr/bin/env python
import sys
from time import sleep
from datetime import datetime


def main(name: str, time_interval: float):
    cnt = 0
    while True:
        cnt += 1
        sys.stdout.write(datetime.now().isoformat())
        sys.stdout.flush()
        sleep(time_interval)
        sys.stdout.write('\r')
        sys.stdout.flush()


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('usage: mockproc <string> <sleep interval>')
        sys.exit(-1)
    name = sys.argv[1]
    interval = float(sys.argv[2])
    main(name, interval)
    sys.exit(0)

