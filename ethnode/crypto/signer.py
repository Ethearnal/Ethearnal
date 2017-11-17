from toolkit.kadmini_codec import sign_message as rsa_sign_message
from toolkit.kadmini_codec import pub_der_guid_bts, sha256_bin_digest


class SignerInterface(object):
    def sign(self, bin_data: bytes) -> bytes:
        return b''

    @property
    def owner(self) -> bytes:
        return b''

    @staticmethod
    def hash_func(data: bytes) -> bytes:
        return b''


class LocalRsaSigner(SignerInterface):
    def __init__(self, prv_key_bin, pub_key_bin, hash_func=sha256_bin_digest):
        self.prv_key_bin = prv_key_bin
        self.pub_key_bin = pub_key_bin
        self.guid = hash_func(self.pub_key_bin)
        self.hash_func = sha256_bin_digest

    def sign(self, bin_data: bytes):
        sig_bin = rsa_sign_message(bin_data, self.prv_key_bin)
        return sig_bin

    @property
    def owner(self):
        return self.guid

