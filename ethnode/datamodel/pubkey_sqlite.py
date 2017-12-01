from datamodel.base_sqlite import BaseSQLite
from toolkit.kadmini_codec import pub_der_guid_bts
# pubkey
# pk_owner_hash_bin
# rsa_pubkey_bin


class PubkeySQLite(BaseSQLite):
    def __init__(self, db_name, table_name):
        super(PubkeySQLite, self).__init__(db_name)
        self.table_name = table_name
        self._create_table_if_not_exist()

    def _create_table_if_not_exist(self, qs_only=False):
        qs = '''
        CREATE TABLE IF NOT EXISTS %s
        (
        pk_hash blob PRIMARY KEY,
        rsa_pubkey_bin blob UNIQUE
        );
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            return self.cursor.execute(qs)

    def create(self, rsa_pubkey_bin: bytes, qs_only=False):
        qs = 'INSERT INTO %s VALUES (?,?);'
        pk_hash = pub_der_guid_bts(rsa_pubkey_bin)
        values = (pk_hash, rsa_pubkey_bin)
        if qs_only:
            return qs, values
        else:
            return self.cursor.execute(qs, values)

    def delete(self,
                        pk_hash: bytes,
                        qs_only=False
                        ):
        qs = 'DELETE FROM %s WHERE pk_hash=?;' % self.table_name
        if qs_only:
            return qs, (pk_hash,)
        else:
            return self.cursor.execute(qs, (pk_hash,))

    def read(self,
             pk_hash: bytes,
             qs_only=False):
        qs = 'SELECT * FROM %s WHERE pk_hash=?' % self.table_name
        if qs_only:
            return qs, (pk_hash,)
        else:
            return self.cursor.execute(qs, (pk_hash,))

    def all(self, qs_only=False):
        qs = 'SELECT * FROM %s;'
        if qs_only:
            return qs, tuple()
        else:
            return self.cursor.execute(qs)

    def fetchone(self, pk_hash: bytes):
        c = self.read(pk_hash)
        return c.fetchone()

    def fetchall(self):
        return self.all().fetchmany()




