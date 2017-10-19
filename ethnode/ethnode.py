# author hardc0de
import sys, os
import argparse
import httpsrv
from multiprocessing import Process
from toolkit import mockproc
from toolkit import crypto
from toolkit.tools import kwargs, mkdir
import config

parser = argparse.ArgumentParser(description='Ethearnal p2p node')

parser.add_argument('-l', '--http_host_port',
                    default=config.http_host_port,
                    help='E,g 127.0.0.1:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.data_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)


def main():
    args = parser.parse_args()
    socket_host, socket_port = args.http_host_port.split(':')

    if os.path.isdir(args.data_dir):
        print('Using existing profile directory: %s' % args.data_dir)
    else:
        mkdir(args.data_dir)

    p1 = Process(target=httpsrv.main, kwargs=kwargs(socket_host=socket_host,
                                                    socket_port=int(socket_port),
                                                    http_webdir=config.http_webdir,
                                                    profile_dir=args.data_dir),
                 )
    p2 = Process(target=mockproc.main, args=('p2', 1))
    p3 = Process(target=crypto.test_rsa_generic)
    p3.start()
    p1.start()
    p2.start()
    p3.join()
    p1.join()
    p2.join()
    return 0


if __name__ == '__main__':
    sys.exit(main())

