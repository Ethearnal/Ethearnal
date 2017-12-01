from toolkit.kadmini_codec import guid_bin_to_hex
from toolkit.kadmini_codec import guid_hex_to_bin


class SignedBinResource(object):
    def __init__(self):
        self.owner_bin = b''
        self.pk_bin = b''
        self.sig_bin = b''
        self.data_bin = b''
        self.content_type = b''
        self.content_encoding = b''
        self.orig_res_hash = b''

    @property
    def res_hex(self):
        try:
            return guid_bin_to_hex(self.orig_res_hash)
        except:
            print('SignedBinResource: guid_bin_to_hex failed')

    @res_hex.setter
    def res_hex(self, val):
        try:
            self.orig_res_hash = guid_hex_to_bin(val)
        except:
            print('SignedBinResource: guid_bin_to_hex failed')

    @property
    def pk_hex(self):
        try:
            return guid_bin_to_hex(self.pk_bin)
        except:
            print('SignedBinResource: guid_bin_to_hex failed')

    @pk_hex.setter
    def pk_hex(self, val):
        try:
            self.pk_bin = guid_hex_to_bin(val)
        except:
            print('SignedBinResource: guid_bin_to_hex failed')

    @property
    def content_type_str(self) -> str:
        return self.content_type.decode()

    @content_type_str.setter
    def content_type_str(self, val) -> str:
        self.content_type = val.encode()

    @property
    def content_encoding_str(self) -> str:
        return self.content_encoding.decode()

    @content_encoding_str.setter
    def content_encoding_str(self, val):
        self.content_encoding = val.encode()
