
class HashIO(object):
    def __call__(self, *args, **kwargs):
        pass

    def bin(self):
        pass

    def hex(self):
        pass


class PulseCallerIO(object):
    def push(self, key: dict, value: dict) -> HashIO:
        pass

    def pull(self, owner: HashIO, key: dict) -> dict:
        pass


class PulseListenerIO(object):
    def on_push(self, key: dict, value: dict, res_hash: HashIO):
        pass

    def on_pull(self, owner: HashIO, key: dict,  value: dict):
        pass


class IteratorIO(object):
    def iterator(self):
        pass

