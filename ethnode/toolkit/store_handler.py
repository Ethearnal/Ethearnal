from toolkit import kadmini_codec as cdx
from toolkit.store_sqlite import ErtDHTSQLite, ErtREFSQLite
# storage router/ mux/ demux
# status wip

# protocol one
# <name_space>:<key>
# ert:pubkey - to handle pubkey exchange
# push qry:?whatever_query_string handle in queries
# 1) push qry first
# 2) pull qry resp then


class DHTStoreHandlerOne(object):
    def __init__(self, dht_sqlite_file=None, pubkeys_sqlite_file=None):
        # dht store for all the things
        if not dht_sqlite_file:
            self.store = dict()
        else:
            self.store = ErtDHTSQLite(dht_sqlite_file)
        # hk:( owner_guid, sig, bson_coded_value )
        # bson_coded_value -> rev, data dict
        # refs
        if not pubkeys_sqlite_file:
            self.pubkeys = dict()
        else:
            self.pubkeys = ErtREFSQLite(pubkeys_sqlite_file)

        # self.query_store, no permanent query store
        # eg ?guids, select quids cursor, and emulate it via kv

    # local push
    def push(self, key, val, signature, guid_owner):
        print('STORE HANDLER PUSH')
        print('HK', key)
        # sig_val = (signature, val)
        owner_signature_value = (guid_owner, signature, val)
        revision, data = cdx.decode_bson_val(val)

        if 'ert:pubkey' in data:
            pubkey_der = data['ert:pubkey']
            # print('PUBKEY DER', pubkey_der)
            is_ok = cdx.verify_message(val, signature, pubkey_der)
            print('PUBKEY RCV')
            if is_ok:
                print('SIGNATURE OK')
                if cdx.pub_der_guid_bts(pubkey_der) == guid_owner:
                    print('FROM HASH OK')
                    # todo may be check before all checks
                    if guid_owner not in self.pubkeys:
                        print('STORE PUB KEY')
                        # store only reference
                        self.pubkeys[guid_owner] = key
                        print('STORE IN DHT')
                        return self.store.__setitem__(key, owner_signature_value)
                    else:
                        print('PUB KEY EXIST')
                        return
            else:
                print('CHECKS FAILED PUBKEY NOT STORED')
                return
        else:
            print('STORE RCV')
            print('guid_owner', guid_owner)
            if guid_owner in self.pubkeys:
                print('HAVE PUBKEY', guid_owner)
                hk_from_store = self.pubkeys[guid_owner]
                hk = hk_from_store
                if isinstance(hk_from_store, bytes):
                    hk = cdx.guid_bts_to_int(hk_from_store)
                elif isinstance(hk_from_store, int):
                    hk = hk_from_store
                else:
                    raise ValueError('HKEY REF PUBKEY ERROR')

                pk_owner, pk_signature, pk_value = self.pull(hk)
                # pk_value =
                pk_rev, pubkey_data = cdx.decode_bson_val(pk_value)
                if 'ert:pubkey' in pubkey_data:
                    print('ert:pubkey IN local DHT')
                    pubkey_der = pubkey_data['ert:pubkey']
                    val_ok = cdx.verify_message(val, signature, pubkey_der)
                    if val_ok:
                        print('VAL SIG OK STORE IN DHT')

                        # event handler here

                        return self.store.__setitem__(key, owner_signature_value)
                    else:
                        print('VAL SIG FAILED')
                else:
                    'ERR ert:pubkey not found'
            else:
                print('NO PUB KEY FOUND')
                print('TRIGGER REQUEST PUBKEY HERE')

    # local pull

    def pull(self, hk):
        print('STORE HANDLER PULL', hk)
        return self.store.get(hk)

    def __contains__(self, hk):
        print('STORE HANDLE contains', hk)
        return self.store.__contains__(hk)

    def iter(self):
        print('STORE HANDLER ITERATOR')
        return self.store.__iter__()

    def verify(self, own, sig, val):
        if own in self.pubkeys:
            hk_own = self.pubkeys[own]
            if hk_own in self.store:
                pk_o, pk_sig, pk_coded = self.pull(hk_own)
                pk_rev, pk_d = cdx.decode_bson_val(pk_coded)
                pk_der = pk_d['ert:pubkey']
                is_ok = cdx.verify_message(val, sig, pk_der)
                return is_ok
            else:
                print('HK PUBKEY NOT FOUND, STORE INTEGRITY ERR')
        else:

            # event handler here
            
            print('PUBKEY NOT FOUND, TRIGGER PULL HERE')

