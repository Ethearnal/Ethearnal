import sqlite3
from toolkit.kadmini_codec import guid_int_to_bts
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

    def __init__(self, db_path_name):
        self.db_name = db_path_name
        self.conn = sqlite3.connect(self.db_name)
        self.curr = self.conn.cursor()
        self.curr.execute(DHT_TABLE_CREATE)

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

    def get_guid_sign_val(self, hkey):
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.curr.execute(GET_ITEM_BY_HKEY, (hkey,))
        t = self.curr.fetchone()
        if t:
            return t

    def insert_item(self, hkey, guid, sign, bval):
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.curr.execute(INSERT_ITEM, (hkey, guid, sign, bval))

    def update_item(self, hkey, guid, sign, bval):
        hkey = self.handle_hkey_type(hkey)
        self.check_hkey_sz(hkey)
        self.curr.execute(UPDATE_ITEM, (guid, sign, bval, hkey))

    def __setitem__(self, hkey, guid_sign_bval):
        #
        guid, sign, bval = guid_sign_bval
        try:
            self.insert_item(hkey, guid, sign, bval)
            self.conn.commit()
        except sqlite3.IntegrityError:
            self.update_item(hkey, guid, sign, bval)
            self.conn.commit()

    def __getitem__(self, hkey):
        #
        return self.get_guid_sign_val(hkey)

    def __iter__(self):
        # todo when needed
        return iter([])




