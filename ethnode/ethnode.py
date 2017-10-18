# author hardc0de
from websrv import httpsrv
from multiprocessing import Process
from toolkit import mockproc
from toolkit import crypto

if __name__ == '__main__':
    p1 = Process(target=httpsrv.main, args=('webdoc',))
    p2 = Process(target=mockproc.main, args=('p2', 1))
    p3 = Process(target=crypto.test_rsa_generic)
    p3.start()
    p1.start()
    p2.start()
    p3.join()
    p1.join()
    p2.join()


