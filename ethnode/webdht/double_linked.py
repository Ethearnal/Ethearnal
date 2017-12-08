# from kadem.kad import DHTFacade


class DLItem(object):
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev_key = None
        self.next_key = None


class DList(object):
    def __init__(self):
        self.dht = dict()
        self.last_key = None
        self.first_key = None

    def insert(self, key, value):
        if not self.last_key:
            self.first_key = key
            self.last_key = key
            o_item = DLItem(key, value)
            o_item.prev_key = key
            o_item.next_key = key
            self.dht.__setitem__(key, o_item)
        else:
            o_item = self.dht.get(key)
            if o_item:
                # update
                o_item.value = value
                self.dht.__setitem__(o_item.key, o_item)
            else:
                # insert
                pass
                o_last_item = self.dht.get(self.last_key)
                self.last_key = key
                o_last_item.next_key = key
                self.dht.__setitem__(o_last_item.key, o_last_item)
                o_item = DLItem(key, value)
                o_item.prev_key = o_last_item.key
                self.dht.__setitem__(o_item.key, o_item)

    def iterate_items(self):
        if self.first_key:
            nx_key = self.first_key
            while nx_key:
                item = self.dht.get(nx_key)
                if item:
                    nx_key = item.next_key
                    yield item
                else:
                    break
        else:
            pass

    def iterate_keys(self):
        for item in self.iterate_items():
            yield item.key

    def iter_values(self):
        for item in self.iterate_items():
            yield item.value

    def iter_kv(self):
        for item in self.iterate_items():
            yield (item.key, item.value)



