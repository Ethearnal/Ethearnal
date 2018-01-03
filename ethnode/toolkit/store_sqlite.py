import os
import sqlite3
import threading
from toolkit.kadmini_codec import guid_int_to_bts

# todo DRY another base


class BaseSQLite(object):
    th_conn = dict()

    def __init__(self, db_name):
        self.db_name = db_name

    @classmethod
    def dbid(cls, db_name):
        th_id = '%s:%s:%s:%s' % (db_name, os.getpid(), str(cls), str(threading.current_thread().ident))
        return th_id

    @classmethod
    def get_connection(cls, db_name):
        th_id = cls.dbid(db_name)
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
    def connection(self):
        conn = self.get_connection(self.db_name)
        return conn

    @property
    def cursor(self):
        conn = self.get_connection(self.db_name)
        return conn.cursor()

    @property
    def th_id(self):
        return threading.current_thread()

    @staticmethod
    def check_hkey_sz(hkey_bts):
        if len(hkey_bts) != 32:
            raise ValueError('ErtDHTSQlite: hkey should be exact 32 bytes')

    @staticmethod
    def handle_hkey_type(hkey):
        if isinstance(hkey, int):
            hkey = guid_int_to_bts(hkey)
            return hkey
        elif isinstance(hkey, bytes):
            return hkey
        else:
            raise ValueError('ErtDHTSQLite: hkey should binary or int')


DHT_TABLE_CREATE = '''
CREATE TABLE IF NOT EXISTS ertdht
(
hkey blob PRIMARY KEY,
guid blob,
sign blob,
bval blob
);
'''

DHT_GET_ITEM_BY_HKEY = 'SELECT guid,sign,bval FROM ertdht WHERE hkey=?;'
DHT_INSERT_ITEM = 'INSERT INTO ertdht VALUES (?,?,?,?);'
DHT_UPDATE_ITEM = 'UPDATE ertdht SET guid=?, sign=?, bval=? WHERE hkey=?;'


class ErtDHTSQLite(BaseSQLite):

    def __init__(self, db_name):
        super(ErtDHTSQLite, self).__init__(db_name)
        self.init_db()

    def init_db(self):
        self.cursor.execute(DHT_TABLE_CREATE)

    def get_guid_sign_val(self, hkey):
        print('DHT UPDATE th_id:', self.dbid(self.db_name))
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        c = self.cursor.execute(DHT_GET_ITEM_BY_HKEY, (hkey,))
        t = c.fetchone()
        if t:
            return t

    def insert_item(self, hkey, guid, sign, bval):
        print('DHT INSERT th_id:', self.dbid(self.db_name))
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(DHT_INSERT_ITEM, (hkey, guid, sign, bval))

    def update_item(self, hkey, guid, sign, bval):
        print('DHT UPDATE th_id:', self.dbid(self.db_name))
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(DHT_UPDATE_ITEM, (guid, sign, bval, hkey))

    def __setitem__(self, hkey, guid_sign_bval):
        #
        guid, sign, bval = guid_sign_bval
        try:
            self.insert_item(hkey, guid, sign, bval)
            self.connection.commit()
        except sqlite3.IntegrityError:
            self.update_item(hkey, guid, sign, bval)
            self.connection.commit()

    def get(self, hkey):
        return self.get_guid_sign_val(hkey)

    def __contains__(self, hkey):
        item = self.get_guid_sign_val(hkey)
        if item:
            return True
        else:
            return False

    def __getitem__(self, hkey):
        #
        return self.get_guid_sign_val(hkey)

    def __iter__(self):
        # todo when needed
        return iter([])


REF_TABLE_CREATE = '''
CREATE TABLE IF NOT EXISTS ertref
(
bkey blob PRIMARY KEY,
hkey blob
);
'''

REF_INSERT_ITEM = 'INSERT INTO ertref VALUES (?,?);'
REF_GET_BY_BKEY = 'SELECT * FROM ertref WHERE bkey=?;'
REF_UPDATE_ITEM = 'UPDATE ertref SET hkey=? WHERE bkey=?;'
SELECT_ALL = 'SELECT * FROM ertref;'


class ErtREFSQLite(BaseSQLite):
    def __init__(self, db_name):
        super(ErtREFSQLite, self).__init__(db_name)
        self.init_db()

    def select_all(self):
        return self.cursor.execute(SELECT_ALL)

    def init_db(self):
        self.cursor.execute(REF_TABLE_CREATE)

    def insert_item(self, bkey, hkey):
        print('PUBKEY REF INSERT dbid:', self.dbid(self.db_name))
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(REF_INSERT_ITEM, (bkey, hkey))

    def update_item(self, bkey, hkey):
        print('PUBKEY REF UPDATE dbid:', self.dbid(self.db_name))
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(REF_UPDATE_ITEM, (hkey, bkey))

    def get_hkey(self, bkey):
        print('PUBKEY REF SELECT dbid:', self.dbid(self.db_name))
        c = self.cursor.execute(REF_GET_BY_BKEY, (bkey,))
        t = c.fetchone()
        if t:
            return t[1]

    def __setitem__(self, bkey, hkey):
        #
        try:
            self.insert_item(bkey, hkey)
            self.connection.commit()
        except sqlite3.IntegrityError:
            self.update_item(bkey, hkey)
            self.connection.commit()

    def get(self, bkey):
        return self.get_hkey(bkey)

    def __contains__(self, bkey):
        item = self.get_hkey(bkey)
        if item:
            return True
        else:
            return False

    def __getitem__(self, bkey):
        #
        return self.get_hkey(bkey)

    def __iter__(self):
        for item in self.select_all().fetchall():
            yield item
