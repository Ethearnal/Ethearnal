from toolkit import kadmini_codec as cdx
from toolkit.store_sqlite import ErtDHTSQLite, ErtREFSQLite
from kadem.kad import DHTFacade
# storage router/ mux/ demux
# status wip

# protocol one
# <name_space>:<key>
# ert:pubkey - to handle pubkey exchange
# push qry:?whatever_query_string handle in queries
# 1) push qry first
# 2) pull qry resp then


class DHTStoreHandlerOne(object):
    ON_PUSH_PEER_KEY = 'ert:peer'
    ON_PUSH_GUID_KEY = 'ert:guid'

    # ON_PUSH_REQUEST_PEERS = 'ert:req:udp_ip4_peers'
    # ON_PULL_REQUEST_PEERS = 'ert:peer'
    # ON_PEERS_REQUEST

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

        self._dhf = None

        # self.query_store, no permanent query store
        # eg ?guids, select quids cursor, and emulate it via kv

    @property
    def dhf(self):
        return self._dhf

    @dhf.setter
    def dhf(self, val):
        self._dhf = val

    def on_pushed_ip4_peer(self, data, hk_int=None):
        if self.dhf.indexer:
            try:
                self.dhf.indexer.index_on(cdx.guid_int_to_hex(hk_int), data)
            except Exception as e:
                print('ERROR indexing', str(e))

        if 'ert:boot_to' in data:
            host = data['ert:boot_to']['h']
            port = data['ert:boot_to']['p']
            print(' + + \n\nPEER DHT BOOT TO:',  host, port)
            self.dhf.direct_push_pubkey(host, port)
            self.dhf.boot_to(host, port)
        # on cdn url post update

        if 'cdn_url' in data and 'hk_hex' in data and self.dhf.cdn:
            if self.dhf.cdn.cdn_url in data['cdn_url']:
                print('CDN ITSELF')
                return
            print('PUSHED RESOURCE ON CDN %s?hkey=%s' % (data['cdn_url'], data['hk_hex']))
            meta_bts = self.dhf.cdn.get_remote_meta_data(hkey=data['hk_hex'], cdn_url=data['cdn_url'])
            import json
            meta_dict = json.loads(meta_bts.decode())
            try:
                self.dhf.cdn.set_local_meta_data(hkey=meta_dict['hkey'], data=meta_dict)
            except Exception as e:
                print('meta err', e)
            if 'fext' in meta_dict and self.dhf.cdn:
                print('SETTING', meta_dict)
                try:
                    bts = self.dhf.cdn.get_remote_data(
                        cdn_url=data['cdn_url'],
                        hkey=meta_dict['hkey'])
                    if bts:
                        self.dhf.cdn.set_local_data(hkey=meta_dict['hkey'],
                                                    fext=meta_dict['fext'],
                                                    bts=bts)
                    else:
                        print('no BYTES from REMOTE')
                        raise ValueError('no BYTES from REMOTE')
                except Exception as e:
                    raise e

    def on_pushed_ip4_ping(self, data):
        # value = {'ert:pong_to': {'h': host, 'p': port}}
        print("ON PUSHED IP4 PING DATA:", data)
        if 'ert:boot_to' in data:
            val = data['ert:boot_to']
            host = val['h']
            port = val['p']
            print(' + + \n\nPING DHT BOOT TO',  host, port)
            self.dhf.direct_push_pubkey(host, port)
            self.dhf.boot_to(host, port)

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
                        # pk_rev, data = cdx.decode_bson_val(pk_value)
                        # if self.ON_PUSH_PEER_KEY in key:
                        print('\n\n\n +++')
                        self.on_pushed_ip4_peer(data, hk_int=key)
                        print('\n\n\n +++')
                        # event handler here
                        return self.store.__setitem__(key, owner_signature_value)
                    else:
                        print('VAL SIG FAILED')
                else:
                    'ERR ert:pubkey not found'
            else:
                print('NO PUB KEY FOUND')

    # local pull

    def pull(self, hk):
        print('STORE HANDLER PULL', hk)
        t = self.store.get(hk)
        if t:
            try:
                pk_owner, pk_signature, pk_value = self.store.get(hk)
                revision, data = cdx.decode_bson_val(pk_value)
                # print(data, data[self.ON_PUSH_PEER_KEY])

                if self.ON_PUSH_GUID_KEY in data:
                    print('\n\n\n GUIDS REQUESTED \n\n\n')
                    v = data[self.ON_PUSH_GUID_KEY]
                    print(v)
                    return

                if self.ON_PUSH_PEER_KEY in data:
                    # self.dhf.pus
                    v = data[self.ON_PUSH_PEER_KEY]
                    host = v['h']
                    port = v['p']
                    print('\n \n \n \n \n + + @ SEND PEER TO BOOT', host, port)
                    for item in self.dhf.peers:
                        try:
                            peer_host = item['host']
                            peer_port = item['port']
                            key = {'ert': 'boot_to'}
                            value = {'ert:boot_to': {'h': peer_host, 'p': peer_port}}
                            self.dhf.direct_push_pubkey(host, port)
                            self.dhf.direct_push(key, value, host, port)
                            # self.dhf.boot_to(peer_host, peer_port)
                        except Exception as e:
                            print('ERROR bootstaraping peers to requester', str(e))
                    return
                    #? todo return ?
            except Exception as e:
                print('ON PULL DECODING FAIL', str(e))
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

