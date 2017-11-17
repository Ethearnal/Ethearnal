import bson
import zlib


class CodecInterface(object):
    def encode(self, obj: object) -> bytes:
        return b''

    def decode(self, data_bytes: object) -> object:
        return None


class CodecJson(CodecInterface):
    def encode(self, obj: object):
        pass
    def decode(self, data_bytes):
        pass