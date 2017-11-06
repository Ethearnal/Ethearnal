from toolkit import kadmini_codec as cdx
# storage router/ mux/ demux
# status wip


class DHTStoreHandlerMem(object):
    def __init__(self):
        # dht store for all the things
        self.store = dict()
        # refs
        self.pubkeys = dict()

    # local push
    def push(self, key, val, signature, from_guid):
        print('STORE HANDLER PUSH')
        sig_val = (signature, val)
        revision, data = cdx.decode_bson_val(val)
        if 'ert:pubkey' in data:
            pubkey_der = data['ert:pubkey']
            # print('PUBKEY DER', pubkey_der)
            is_ok = cdx.verify_message(val, signature, pubkey_der)
            print('PUBKEY RCV')
            if is_ok:
                print('SIGNATURE OK')
                if cdx.pub_der_guid_bts(pubkey_der) == from_guid:
                    print('FROM HASH OK')
                    # todo may be check before all checks
                    if from_guid not in self.pubkeys:
                        print('STORE PUB KEY')
                        # store only reference
                        self.pubkeys[from_guid] = key
                        print('STORE IN DHT')
                        return self.store.__setitem__(key, val)
                    else:
                        print('PUB KEY EXIST')
                        return
            else:
                print('CHECKS FAILED PUBKEY NOT STORED')
                return
        else:
            print('STORE RCV')
            if from_guid in self.pubkeys:
                print('HAVE PUBKEY', from_guid)
                hk = self.pubkeys[from_guid]
                pubkey_val = self.pull(hk)
                pk_rev, pubkey_data = cdx.decode_bson_val(pubkey_val)
                if 'ert:pubkey' in pubkey_data:
                    print('ert:pubkey IN local DHT')
                    pubkey_der = pubkey_data['ert:pubkey']
                    val_ok = cdx.verify_message(val, signature, pubkey_der)
                    if val_ok:
                        print('VAL SIG OK STORE IN DHT')
                        return self.store.__setitem__(key, val)
                    else:
                        print('VAL SIG FAILED')
                else:
                    'ERR ert:pubkey not found'
            else:
                print('NO PUB KEY FOUND')
                print('REQUEST PUBKEY HERE')

    # local pull

    def pull(self, key):
        print('STORE HANDLER PULL')
        return self.store.__getitem__(key)

    def __contains__(self, item):
        print('STORE HANDLE contains', item)
        return self.store.__contains__(item)

    def iter(self):
        print('STORE HANDLER ITERATOR')
        return self.store.__iter__()

    def __setitem__(self, key, value):
        print('Remove this __set__')
        raise ValueError('Remove this __set__')
        # return self.push(key, value)

    def __getitem__(self, item):
        print('Remove this __get__')
        raise ValueError('Remove this __get__')
        # return self.pull(item)

    def __iter__(self):
        raise ValueError('Remove this __iter__')
        # return self.store.__iter__()
