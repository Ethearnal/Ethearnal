from datamodel.base_sqlite import BaseSQLite

# encoded bin resource store

# pk_hash = hash(owner,res,sig)
# owner_hash_bin
# resource_hash_bin
# resource_owner_sig_bin
# resource_codec_chain_bin
# resource_data_bin
# is_active_bool
# is_encrypted_bool


class ResourceSQLite(BaseSQLite):
    def __init__(self, db_name, table_name):
        super(ResourceSQLite, self).__init__(db_name)
        self.table_name = table_name

    def create_table_if_not_exist(self, qs_only=False):
        qs = '''
        CREATE TABLE IF NOT EXISTS %s
        (
        pk_hash blob PRIMARY KEY,
        owner_hash_bin blob,
        resource_hash_bin blob,
        resource_owner_sig_bin blob,
        resource_codec_chain_bin blob,
        resource_data_bin blob,
        is_encrypted_bool bool,
        is_active_bool
        );
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            return self.cursor.execute(qs)

    def insert_resource(self,
                        pk_hash: bytes,  # owner + resource
                        owner_hash: bytes,
                        resource_hash: bytes,
                        resource_own_sig: bytes,
                        resource_codec_chain_bin: bytes,
                        resource_data_bin: bytes,
                        is_encrypted_bool: bool,
                        is_active_bool: bool,
                        qs_only: bool=False
                        ):

        values = (
            pk_hash,
            owner_hash,
            resource_hash,
            resource_own_sig,
            resource_codec_chain_bin,
            resource_data_bin,
            is_encrypted_bool,
            is_active_bool,
        )

        qs = 'INSERT INTO %s VALUES (?,?,?,?,?,?,?,?);' % self.table_name
        if qs_only:
            return qs, values
        else:
            return self.cursor.execute(qs, values)

    def delete_resource(self,
                        pk_hash: bytes,
                        qs_only=False
                        ):
        qs = 'DELETE FROM %s WHERE pk_hash=?;' % self.table_name
        if qs_only:
            return qs, (pk_hash,)
        else:
            return self.cursor.execute(qs, (pk_hash,))








