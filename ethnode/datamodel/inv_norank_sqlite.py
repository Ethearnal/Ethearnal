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
        self.create_index_if_not_exist('idx_cmp_hash', 'component_hash')
        self.create_index_if_not_exist('idx_ctx_hash', 'container_hash')
        self.create_index_if_not_exist('idx_cmp_ctx_hash', 'component_hash,container_hash')

        self.analog_range_q1_pair = None

        from time import sleep
        sleep(1)
        self.count_ctx()
        sleep(5)

    def count_ctx(self,  qs_only=False):
        qs = '''
        SELECT DISTINCT container_hash FROM %s;
        ''' % self.table_name

        if qs_only:
            return qs, ()

        else:
            c = self.cursor.execute(qs)
            self.connection.commit()
            print('\n\n\n COUNT container_hash', len(c.fetchall()))
            print('\n\n\n')

    def create_index_if_not_exist(self, idx_name, colnames, qs_only=False):
        qs = '''
        CREATE INDEX IF NOT EXISTS %s ON %s(%s); 
        ''' % (idx_name, self.table_name, colnames)
        if qs_only:
            return qs, ()

        else:
            self.cursor.execute(qs)
            self.connection.commit()
            print('\n\n\n IDX CREATED', qs)
            print('\n\n\n')


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

    @property
    def analog_range_q1(self):
        return self.analog_range_q1_pair

    @analog_range_q1.setter
    def analog_range_q1(self, ll):
        if ll is None:
            self.analog_range_q1_pair = None
        try:
            self.analog_range_q1_pair = tuple([int(k) for k in ll[0:2]])
        except Exception as e:
            print('WARN settings of q1 range failed', e)

    def create(self, component_hash: bytes,
               container_hash: bytes,
               q1: int=0,
               q2: int=0,
               qs_only=False):
        qs = 'INSERT INTO %s VALUES (?,?,?,?,?,?,?,?);' % self.table_name

        utc_timestamp = int(datetime.utcnow().timestamp())
        ert_tokens_major = 1
        ert_tokens_minor = 1
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
            print('\n\n\n INDEX QS QS', qs)

    def __depricated_no_component(self, limit=100, qs_only=False):
        analog_range_q1 = ''
        if self.analog_range_q1:
            analog_range_q1 = ' WHERE(q1 BETWEEN %d AND %d) ' % self.analog_range_q1

        if limit:
            qs = 'SELECT DISTINCT a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 ' \
                 '  FROM %s a {analog_range} ' \
                 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC LIMIT %d;' % (
                    self.table_name, limit)
        else:
            qs = 'SELECT DISTINCT a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 '\
                 'FROM %s a {analog_range} ' \
                 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC %d;' % (self.table_name, limit)
        qs = qs.format(analog_range=analog_range_q1)

        if qs_only:
            return qs, (None, )
        c = self.cursor.execute(qs)
        print('\n\n\n SEARCH QS ', qs)
        self.analog_range_q1_pair = None
        return c

    def no_component(self, limit=100, qs_only=False):
        analog_range_q1 = ''
        if self.analog_range_q1:
            analog_range_q1 = ' WHERE(q1 BETWEEN %d AND %d) ' % self.analog_range_q1

        if limit:
            qs = 'SELECT DISTINCT a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 ' \
                 '  FROM %s a {analog_range} ' \
                 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC, a.q1 ASC, a.q2 ASC LIMIT %d;' % (
                    self.table_name, limit)
        else:
            qs = 'SELECT DISTINCT a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 '\
                 'FROM %s a {analog_range} ' \
                 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC, a.q1 ASC, a.q2 ASC %d;' % (self.table_name, limit)
        qs = qs.format(analog_range=analog_range_q1)

        if qs_only:
            return qs, (None, )
        c = self.cursor.execute(qs)
        print('\n\n IDX NO CPM', qs)
        self.analog_range_q1_pair = None
        return c

    # def __depricated_single_component(self, component_hash, asc=True, qs_only=False, limit=30):
    #     print('\n\nLIMIT', limit)
    #     if asc:
    #         order_st = ' ORDER BY a.ert_tokens_major, a.utc_timestamp LIMIT %d; ' % limit
    #     else:
    #         order_st = ' ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC LIMIT %d; ' % limit
    #
    #     qs = 'SELECT DISTINCT * FROM %s a WHERE a.component_hash=? %s' % (
    #         self.table_name,
    #         order_st
    #     )
    #     print('\n\nQS', limit)
    #     if qs_only:
    #         return qs, (component_hash,)
    #     c = self.cursor.execute(qs, (component_hash,))
    #     return c

    def single_component(self, component_hash, asc=True, qs_only=False, limit=30):

        # print('\n\nLIMIT', limit)
        select_st = 'SELECT DISTINCT a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 '
        from_st = 'FROM %s a ' % self.table_name
        order_st = 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC, a.q1 ASC, a.q2 ASC '

        analog_range_q1 = ''
        if self.analog_range_q1:
            analog_range_q1 = 'AND (q1 BETWEEN %d AND %d) ' % self.analog_range_q1

        where_st = 'WHERE a.component_hash=? %s ' % analog_range_q1
        limit_st = 'LIMIT %d ;' % limit

        qs = '%s %s %s %s %s' % (select_st, from_st, where_st, order_st, limit_st)
        print('\n\n SINGLE COMPONENT', qs)
        if qs_only:
            return qs, (component_hash,)
        try:
            c = self.cursor.execute(qs, (component_hash,))
        except Exception as e:
            print('ERR->', e)
        # print('FETCHALL', c.fetchall())
        print('\n\n IDX SINGLE CPN OK')
        return c

    def delete_components_by_container(self, container_hash: bytes, qs_only=False):
        qs = 'DELETE FROM %s WHERE container_hash=?;' % self.table_name
        if qs_only:
            return qs, (container_hash,)
        c = self.cursor.execute(qs, (container_hash,))
        return c

    # def __depricated_inner_join_on_component(self, *args, asc=True, qs_only=False, limit=30):
    #     if len(args) < 2:
    #         raise ValueError('two or more args required')
    #     first = 'SELECT DISTINCT * FROM %s a ' % self.table_name
    #     inner = 'INNER JOIN {t} {p} ON a.container_hash={p}.container_hash '
    #     andst = 'WHERE a.component_hash=? AND '
    #     and_l = list()
    #     inners = ''
    #     for tpl in enumerate(args[1:]):
    #         idx, arg = tpl
    #         param = 'a%d' % idx
    #         inners += inner.format(t=self.table_name, p=param)
    #         and_st = '%s.component_hash=?' % param
    #         and_l.append(and_st)
    #     ands_st = ' AND '.join(and_l)
    #     order_asc = ' ORDER BY a.ert_tokens_major DESC, a.utc_timestamp DESC LIMIT %d;' % limit
    #     order_dsc = ' ORDER BY a.ert_tokens_major DESC, a.utc_timestamp DESC LIMIT %d;' % limit
    #     if asc:
    #         order = order_asc
    #     else:
    #         order = order_dsc
    #     qs = first+inners+andst+ands_st+order
    #     values = args
    #     if qs_only:
    #         return qs, values
    #     return self.cursor.execute(qs, values)

    def inner_join_on_component(self, *args, asc=True, qs_only=False, limit=30):
        if len(args) < 2:
            raise ValueError('two or more args required')

        analog_range_q1 = ''
        if self.analog_range_q1:
            analog_range_q1 = 'AND (q1 BETWEEN %d AND %d) ' % self.analog_range_q1

        selects = 'a.container_hash, a.ert_tokens_major, a.utc_timestamp, a.q1, a.q2 '
        first = 'SELECT DISTINCT %s FROM %s a ' % (selects, self.table_name)
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
        ands_st += analog_range_q1
        order = 'ORDER BY a.ert_tokens_major ASC, a.utc_timestamp ASC, a.q1 ASC, a.q2 ASC LIMIT %d' % limit
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



