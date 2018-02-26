from kadem.kad import DHTFacade
from toolkit import kadmini_codec as cdx


class DhtKv(object):
    def __init__(self, dhf: DHTFacade):
        self.dhf = dhf
        self.own_guid_hex = self.dhf.ert.rsa_guid_hex

    def get(self, profile_key, guid_hex=None, local=True):
        if not guid_hex:
            guid_hex = self.own_guid_hex
        guid_bin = cdx.guid_hex_to_bin(guid_hex)
        key_proto = {'profile:key': profile_key}
        t = None
        if local:
            t = self.dhf.pull_local(key_proto, guid=guid_bin)
        else:
            t = self.dhf.pull_remote(key_proto, guid=guid_bin)
        if t:
            data = cdx.decode_profile_key_val(t)
            return data

    def set(self, profile_key, profile_value):
        key_proto = {'profile:key': profile_key}
        self.dhf.push(key=key_proto, value={'k': 'profile_key', 'v': profile_value})
