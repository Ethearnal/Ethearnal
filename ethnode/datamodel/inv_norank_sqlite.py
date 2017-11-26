from datamodel.base_sqlite import BaseSQLite
from datetime import datetime
from random import randint

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
        utc_timestamp int,
        ert_tokens_major int,
        ert_tokens_minor int,
        q1 int,
        q2 int
        );
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            self.cursor.execute(qs)
            self.connection.commit()

    @staticmethod
    def pk_compose(component_hash: bytes, container_hash: bytes):
        pk_composite = component_hash + container_hash
        return pk_composite

    def commit(self):
        self.connection.commit()

    def has_item(self, pk_composite: bytes, qs_only=False):
        qs = 'SELECT pk_composite FROM %s WHERE pk_composite=?;' % self.table_name

        if qs_only:
            return qs, (pk_composite,)
        c = self.cursor.execute(qs, (pk_composite,))
        t = c.fetchone()
        if t:
            return True
        else:
            return False

    def create(self, component_hash: bytes,
               container_hash: bytes,
               q1: int=0,
               q2: int=0,
               qs_only=False):
        qs = 'INSERT INTO %s VALUES (?,?,?,?,?,?,?,?);' % self.table_name
        utc_timestamp = int(datetime.utcnow().timestamp())
        ert_tokens_major = randint(0, 10000)
        ert_tokens_minor = randint(0, 10000)
        pk_composite = self.pk_compose(component_hash, container_hash)
        cr = self.has_item(pk_composite)

        if self.has_item(pk_composite):
            return

        values = (
            pk_composite,
            component_hash,
            container_hash,
            utc_timestamp,
            ert_tokens_major,
            ert_tokens_minor,
            q1,
            q2,
        )
        if qs_only:
            return qs, values
        else:
            self.cursor.execute(qs, values)

    def single_component(self, component_hash, asc=True, qs_only=False):
        if asc:
            order_st = ' ORDER BY a.ert_tokens_major, a.utc_timestamp; '
        else:
            order_st = ' ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC; '
        qs = 'SELECT * FROM %s a WHERE a.component_hash=? %s' % (
            self.table_name,
            order_st
        )

        if qs_only:
            return qs, (component_hash,)
        c = self.cursor.execute(qs, (component_hash,))
        return c

    def delete_components_by_container(self, container_hash: bytes, qs_only=False):
        qs = 'DELETE FROM %s WHERE container_hash=?;' % self.table_name
        if qs_only:
            return qs, (container_hash,)
        c = self.cursor.execute(qs, (container_hash,))
        return c

    def inner_join_on_component(self, *args, asc=True, qs_only=False):
        if len(args) < 2:
            raise ValueError('two or more args required')
        first = 'SELECT DISTINCT * FROM %s a ' % self.table_name
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
        order_asc = ' ORDER BY a.ert_tokens_major DESC, a.utc_timestamp DESC LIMIT 100;'
        order_dsc = ' ORDER BY a.ert_tokens_major DESC, a.utc_timestamp DESC LIMIT 100;'
        if asc:
            order = order_asc
        else:
            order = order_dsc
        qs = first+inners+andst+ands_st+order
        values = args
        if qs_only:
            return qs, values
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



