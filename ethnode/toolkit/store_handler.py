from toolkit import kadmini_codec as cdx
# storage router/ mux/ demux
# status wip


class DHTStoreHandlerOne(object):
    def __init__(self):
        # dht store for all the things
        self.store = dict()
        # hk:( owner_guid, sig, bson_coded_value )
        # bson_coded_value -> rev, data dict
        # refs
        self.pubkeys = dict()

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
            if guid_owner in self.pubkeys:
                print('HAVE PUBKEY', guid_owner)
                hk = self.pubkeys[guid_owner]
                pk_owner, pk_signature, pk_value = self.pull(hk)
                # pk_value =
                pk_rev, pubkey_data = cdx.decode_bson_val(pk_value)
                if 'ert:pubkey' in pubkey_data:
                    print('ert:pubkey IN local DHT')
                    pubkey_der = pubkey_data['ert:pubkey']
                    val_ok = cdx.verify_message(val, signature, pubkey_der)
                    if val_ok:
                        print('VAL SIG OK STORE IN DHT')
                        if 'ert:udp:ip4:port' in data:
                            self.ert_ip4_udp_port(data['ert:udp:ip4:port'])

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
            print('PUBKEY NOT FOUND, TRIGGER PULL HERE')

