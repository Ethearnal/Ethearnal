from datamodel.base_sqlite import BaseSQLite
from datetime import datetime

# pk_composite #
# component_hash bin
# container_hash bin
# utc_time_created int


class InvIndexTimestampSQLite(BaseSQLite):
    def __init__(self, db_name, table_name):
        super(InvIndexTimestampSQLite, self).__init__(db_name)
        self.table_name = table_name
        self.create_table_if_not_exist()

    def create_table_if_not_exist(self, qs_only=False):
        qs = '''
        CREATE TABLE IF NOT EXISTS %s
        (
        pk_composite blob PRIMARY KEY,
        component_hash blob,
        container_hash blob,
        utc_timestamp int
        );
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            self.cursor.execute(qs)
            self.connection.commit()

    @staticmethod
    def pk_compose(component_hash: bytes, container_hash: bytes):
        # utc_timestamp_bts = utc_timestamp.to_bytes(8, 'big')
        pk_composite = component_hash + container_hash
        return pk_composite

    def create(self, component_hash: bytes, container_hash: bytes, qs_only=False):
        qs = 'INSERT INTO %s VALUES (?,?,?,?)' % self.table_name
        utc_timestamp = int(datetime.utcnow().timestamp())
        pk_composite = self.pk_compose(component_hash, container_hash)
        values = (
            pk_composite,
            component_hash,
            container_hash,
            utc_timestamp,
        )
        if qs_only:
            return qs, values
        else:
            self.cursor.execute(qs, values)
            self.connection.commit()

    def inner_join_on_component(self, *args, asc=True, qs_only=False):
        if len(args) < 2:
            raise ValueError('two or more args required')

        first = 'SELECT a.container_hash FROM %s a ' % self.table_name
        inner = 'INNER JOIN {t} {p} ON a.container_hash={p}.container_hash '
        andst = 'WHERE a.component_hash=? AND '
        and_l = list()
        inners = ''
        for tpl in enumerate(args[1:]):
            idx, arg = tpl
            param = 'a%d' % idx
            inners += inner.format(t=self.table_name, p=param)
            and_st = '%s.component_hash=?' % param
            and_l.append(and_st)
        ands_st = ' AND '.join(and_l)
        order_asc = ' ORDER BY a.utc_timestamp ASC;'
        order_dsc = ' ORDER BY a.utc_timestamp DSC;'
        if asc:
            order = order_asc
        else:
            order = order_dsc
        qs = first+inners+andst+ands_st+order
        values = args
        # print(qs)
        return self.cursor.execute(qs, values)

    # todo test
    def test_simple(self):
        ctx1 = b'container1'
        ctx2 = b'container2'
        ctx3 = b'container3'
        ls = [b'one', b'two', b'three']
        ls2 = [b'one', b'three']
        for k in ls:
            self.create(k, ctx1)
            self.create(k, ctx2)
        for k in ls2:
            self.create(k, ctx3)
        r1 = self.inner_join_on_component(*tuple(ls)).fetchall()
        r2 = self.inner_join_on_component(*tuple(ls2)).fetchall()
        return r1, r2



