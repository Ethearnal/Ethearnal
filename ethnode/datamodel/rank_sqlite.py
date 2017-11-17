from datamodel.base_sqlite import BaseSQLite
from toolkit.kadmini_codec import q4_quanta_to_bytes
from toolkit.kadmini_codec import composite_hash_sha256

# pk_hash # composite_hash_sha256(component, container)
# quanta_bin UNIQUE
# container_hash_bin # many
# component_hash_bin # many
# q1_int # 8 bytes big
# q2_int # 8 bytes big
# q3_int # 8 bytes big
# q4_int # 8 bytes big
# q1+q2+q3+q4 = quanta bytes


class Rank4SQLite(BaseSQLite):
    def __init__(self, db_name, table_name):
        super(Rank4SQLite, self).__init__(db_name)
        self.table_name = table_name

        # never use table_name from outsource

    def create_table_if_not_exist(self, qs_only=False):
        qs = '''
        CREATE TABLE IF NOT EXISTS %s
        (
        pk_hash blob PRIMARY KEY,
        quanta_bin blob UNIQUE,
        component_hash_bin,
        container_hash_bin,
        q1_int int,
        q2_int int,
        q3_int int,
        q4_int int
        );
        ''' % self.table_name
        if qs_only:
            return qs, ()
        else:
            return self.cursor.execute(qs)

    @staticmethod
    def pk_hash_compose(component_hash_bin: bytes, container_hash_bin: bytes):
        pk_hash = composite_hash_sha256(component_hash_bin, container_hash_bin)
        return pk_hash

    @staticmethod
    def quanta_bin_compose(q1: int, q2: int, q3: int, q4: int):
        return q4_quanta_to_bytes(q1, q2, q3, q4)

    def create(self,
               q1_int: int,
               q2_int: int,
               q3_int: int,
               q4_int: int,
               component_hash_bin: bytes=None,
               container_hash_bin: bytes=None,
               qs_only=False,
               ):

        if not component_hash_bin or not container_hash_bin:
            msg = 'component_hash_bin and container_hash_bin are default kw but required!'
            raise ValueError(msg)

        qs = 'INSERT INTO %s VALUES (?,?,?,?,?,?,?,?)' % self.table_name

        pk_hash = self.pk_hash_compose(component_hash_bin, container_hash_bin)
        quanta_bin = self.quanta_bin_compose(q1_int, q2_int, q3_int, q4_int)

        values = (
            pk_hash,
            quanta_bin,
            component_hash_bin,
            container_hash_bin,
            q1_int,
            q2_int,
            q3_int,
            q4_int,
        )
        if qs_only:
            return qs, values
        else:
            return self.cursor.execute(qs, values)

    def delete_by_component_container(self,
                                      component_hash,
                                      container_hash,
                                      qs_only=False):

        qs = 'DELETE FROM %s WHERE component_hash_bin=?, container_hash_bin=?' % self.table_name
        values = (component_hash, container_hash)
        if qs_only:
            return qs, values
        else:
            return self.cursor.execute(qs, values)


