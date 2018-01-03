import os
import sqlite3
import threading


class BaseSQLite(object):
    th_conn = dict()

    def __init__(self, db_name):
        self.db_name = db_name

    @classmethod
    def get_dbid(cls, db_name):
        th_id = '%s:%s:%s:%s' % (db_name, os.getpid(), str(cls), str(threading.current_thread().ident))
        return th_id


    @classmethod
    def get_connection(cls, db_name):
        th_id = cls.get_dbid(db_name)
        if th_id in cls.th_conn:
            conn = cls.th_conn[th_id]
            if conn:
                return conn
            else:
                cls.th_conn[th_id] = sqlite3.connect(db_name)
                return cls.th_conn[th_id]
        else:
            cls.th_conn[th_id] = sqlite3.connect(db_name)
            return cls.th_conn[th_id]

    @property
    def dbid(self):
        return self.get_dbid(self.db_name)

    @property
    def connection(self):
        conn = self.get_connection(self.db_name)
        return conn

    @property
    def cursor(self):
        conn = self.get_connection(self.db_name)
        return conn.cursor()
