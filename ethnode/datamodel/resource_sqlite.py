from datamodel.base_sqlite import BaseSQLite
from toolkit.kadmini_codec import composite_hash_sha256, sha256_bin_digest
# encoded bin resource store

# pk_hash = hash(owner,res,sig)
# owner_hash_bin
# resource_hash_bin
# resource_owner_sig_bin
# resource_data_bin
# resource_codec_name_bin bin


class ResourceSQLite(BaseSQLite):
    def __init__(self, db_name, table_name):
        super(ResourceSQLite, self).__init__(db_name)
        self.table_name = table_name
        self.create_table_if_not_exist()

    def create_table_if_not_exist(self, qs_only=False):
        qs = '''
        CREATE TABLE IF NOT EXISTS %s
        (
        pk_hash blob PRIMARY KEY,
        owner_hash_bin blob,
        resource_hash_bin blob,
        resource_owner_sig_bin blob,
        content_type_bin blob,
        content_encoding_bin blob,
        resource_data_bin blob
        );
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            self.cursor.execute(qs)
            self.connection.commit()

    @staticmethod
    def pk_hash_compose(owner_hash, res_hash):
        pk_hash = composite_hash_sha256(owner_hash, res_hash)
        return pk_hash

    @staticmethod
    def resource_hash(data_bin: bytes):
        res_hash = sha256_bin_digest(data_bin)
        return res_hash

    def create_resource(self,
                        # pk_hash: bytes,  # hash (owner hash, resource hash)
                        owner_hash: bytes,
                        # resource_hash: bytes,
                        resource_own_sig: bytes,
                        content_type_bin: bytes,
                        content_encoding_bin: bytes,
                        resource_data_bin: bytes,
                        qs_only: bool=False
                        ):
        resource_hash = self.resource_hash(resource_data_bin)
        pk_hash = self.pk_hash_compose(owner_hash, resource_hash)

        r = self.read_resource(pk_hash)
        t = r.fetchone()
        if t:
            return pk_hash

        values = (
            pk_hash,
            owner_hash,
            resource_hash,
            resource_own_sig,
            content_type_bin,
            content_encoding_bin,
            resource_data_bin,
        )

        qs = 'INSERT INTO %s VALUES (?,?,?,?,?,?,?);' % self.table_name
        if qs_only:
            return qs, values
        else:
            self.cursor.execute(qs, values)
            self.connection.commit()
            return pk_hash

    def delete_resource(self,
                        pk_hash: bytes,
                        qs_only=False
                        ):
        qs = 'DELETE FROM %s WHERE pk_hash=?;' % self.table_name
        if qs_only:
            return qs, (pk_hash,)
        else:
            self.cursor.execute(qs, (pk_hash,))
            self.connection.commit()

    def read_resource(self,
                      pk_hash: bytes,
                      qs_only=False):
        qs = 'SELECT * FROM %s WHERE pk_hash=?' % self.table_name
        if qs_only:
            return qs, (pk_hash,)
        else:
            return self.cursor.execute(qs, (pk_hash,))

    def list_by_owner(self,
                      owner_hash: bytes,
                      qs_only=False):
        qs = 'SELECT * FROM %s WHERE owner_hash_bin=?;' % self.table_name
        if qs_only:
            return qs, owner_hash
        else:
            c = self.cursor.execute(qs, (owner_hash,))
            return c.fetchall()

    def fetch_resource(self, pk_hash: bytes):
        c = self.read_resource(pk_hash)
        return c.fetchone()


