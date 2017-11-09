import sqlite3
from toolkit.kadmini_codec import guid_int_to_bts
import threading

# from toolkit.kadmini_codec import guid_bts_to_int

DHT_TABLE_CREATE = '''
CREATE TABLE IF NOT EXISTS ertdht
(hkey blob PRIMARY KEY,
guid blob,
sign blob,
bval blob);
'''

GET_ITEM_BY_HKEY = 'SELECT guid,sign,bval FROM ertdht WHERE hkey=?;'
INSERT_ITEM = 'INSERT INTO ertdht VALUES (?,?,?,?);'
UPDATE_ITEM = 'UPDATE ertdht SET guid=?, sign=?, bval=? WHERE hkey=?;'


class ErtDHTSQLite(object):
    th_conn = dict()

    @classmethod
    def get_connection(cls, db_name):
        th_id = threading.current_thread()
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

    def __init__(self, db_path_name):
        self.db_name = db_path_name
        self.init_db()

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

    def init_db(self):
        self.cursor.execute(DHT_TABLE_CREATE)

    def get_guid_sign_val(self, hkey):
        print('UPDATE th_id:', self.th_id)
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(GET_ITEM_BY_HKEY, (hkey,))
        t = self.cursor.fetchone()
        if t:
            return t

    def insert_item(self, hkey, guid, sign, bval):
        print('INSERT th_id:', self.th_id)
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(INSERT_ITEM, (hkey, guid, sign, bval))

    def update_item(self, hkey, guid, sign, bval):
        print('UPDATE th_id:', self.th_id)
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.cursor.execute(UPDATE_ITEM, (guid, sign, bval, hkey))

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




