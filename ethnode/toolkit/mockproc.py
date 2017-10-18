#!/usr/bin/env python
import sys
from time import sleep


def main(name: str, time_interval: float):
    cnt = 0
    while True:
        cnt += 1
        print('%s: %06d' % (name, cnt))
        sleep(time_interval)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('usage: mockproc <string> <sleep interval>')
        sys.exit(-1)
    name = sys.argv[1]
    interval = float(sys.argv[2])
    main(name, interval)
    sys.exit(0)

