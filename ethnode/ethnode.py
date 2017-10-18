# author hardc0de
from websrv import httpsrv
from multiprocessing import Process
from toolkit import mockproc

if __name__ == '__main__':
    p1 = Process(target=httpsrv.main, args=('webdoc',))
    p2 = Process(target=mockproc.main, args=('p2', 2.5))
    p1.start()
    p2.start()
    p1.join()
    p2.join()


