from datamodel.base_sqlite import BaseSQLite

# encoded bin resource store
# pk_hash = hash(owner,res,sig)
# owner_hash_bin
# resource_hash_bin
# resource_owner_sig_bin
# resource_codec_chain_bin
# resource_data_bin
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
        is_encrypted_bool bool
        );
        ''' % self.table_name

        if qs_only:
            return qs

        else:
            return self.cursor.execute(qs)

    def insert_resource(self,
                        pk_hash: bytes,
                        owner_hash: bytes,
                        
                        ):
        pass



