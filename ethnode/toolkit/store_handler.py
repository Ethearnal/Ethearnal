from toolkit import kadmini_codec as cdx
from toolkit.store_sqlite import ErtDHTSQLite, ErtREFSQLite
from toolkit.tools import ErtLogger, Print

logger = ErtLogger(Print())

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

    @staticmethod
    def pass_push_handle(*args, **kwargs):
        # logger("+ + ++ + + DHTStoreHandlerOne: PUSH EVENT +++ +", args, kwargs)
        pass

    @staticmethod
    def pass_pull_handle(*args, **kwargs):
        # logger("+ + ++ + + DHTStoreHandlerOne: PULL EVENT +++ +", args, kwargs)
        pass

    def __init__(self, dht_sqlite_file=None, pubkeys_sqlite_file=None,
                 on_push_handle=None, on_pull_handle=None):

        # on push event
        if on_push_handle:
            self.on_push_handle = on_push_handle
        else:
            self.on_push_handle = self.pass_push_handle
        # on pull event
        if on_pull_handle:
            self.on_pull_handle = on_pull_handle
        else:
            self.on_pull_handle = self.pass_pull_handle

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
                # logger('ERROR indexing', str(e))
                pass

        if 'ert:boot_to' in data:
            host = data['ert:boot_to']['h']
            port = data['ert:boot_to']['p']
            # logger(' + + \n\nPEER DHT BOOT TO:',  host, port)
            self.dhf.direct_push_pubkey(host, port)
            self.dhf.boot_to(host, port)
        # on cdn url post update

        if 'cdn_url' in data and 'hk_hex' in data and self.dhf.cdn:
            if self.dhf.cdn.cdn_url in data['cdn_url']:
                # logger('CDN ITSELF')
                return
            # logger('PUSHED RESOURCE ON CDN %s?hkey=%s' % (data['cdn_url'], data['hk_hex']))
            meta_bts = self.dhf.cdn.get_remote_meta_data(hkey=data['hk_hex'], cdn_url=data['cdn_url'])
            import json
            meta_dict = json.loads(meta_bts.decode())
            try:
                self.dhf.cdn.set_local_meta_data(hkey=meta_dict['hkey'], data=meta_dict)
            except Exception as e:
                # logger('meta err', e)
                pass
            if 'fext' in meta_dict and self.dhf.cdn:
                # logger('SETTING', meta_dict)
                try:
                    bts = self.dhf.cdn.get_remote_data(
                        cdn_url=data['cdn_url'],
                        hkey=meta_dict['hkey'])
                    if bts:
                        self.dhf.cdn.set_local_data(hkey=meta_dict['hkey'],
                                                    fext=meta_dict['fext'],
                                                    bts=bts)
                    else:
                        # logger('no BYTES from REMOTE')
                        raise ValueError('no BYTES from REMOTE')
                except Exception as e:
                    raise e

    def on_pushed_ip4_ping(self, data):
        # value = {'ert:pong_to': {'h': host, 'p': port}}
        # logger("ON PUSHED IP4 PING DATA:", data)
        if 'ert:boot_to' in data:
            val = data['ert:boot_to']
            host = val['h']
            port = val['p']
            # logger(' + + \n\nPING DHT BOOT TO',  host, port)
            self.dhf.direct_push_pubkey(host, port)
            self.dhf.boot_to(host, port)

    # local push
    def push(self, key, val, signature, guid_owner):

        # logger('HK', key)
        # sig_val = (signature, val)
        owner_signature_value = (guid_owner, signature, val)
        revision, data = cdx.decode_bson_val(val)

        logger('LOCAL PUSH DATA',key, data)

        if 'ert:pubkey' in data:
            pubkey_der = data['ert:pubkey']
            # # logger('PUBKEY DER', pubkey_der)
            is_ok = cdx.verify_message(val, signature, pubkey_der)
            # logger('PUBKEY RCV')
            if is_ok:
                # logger('SIGNATURE OK')
                if cdx.pub_der_guid_bts(pubkey_der) == guid_owner:
                    # logger('FROM HASH OK')
                    # todo may be check before all checks
                    if guid_owner not in self.pubkeys:
                        # logger('STORE PUB KEY')
                        # store only reference
                        self.pubkeys[guid_owner] = key
                        # logger('STORE IN DHT')
                        return self.store.__setitem__(key, owner_signature_value)
                    else:
                        # logger('PUB KEY EXIST')
                        return
            else:
                # logger('CHECKS FAILED PUBKEY NOT STORED')
                return
        else:
            # logger('STORE RCV')
            # logger('guid_owner', guid_owner)
            if guid_owner in self.pubkeys:
                # logger('HAVE PUBKEY', guid_owner)
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
                    # logger('ert:pubkey IN local DHT')
                    pubkey_der = pubkey_data['ert:pubkey']
                    val_ok = cdx.verify_message(val, signature, pubkey_der)
                    if val_ok:
                        # logger('VAL SIG OK STORE IN DHT')
                        # pk_rev, data = cdx.decode_bson_val(pk_value)
                        # if self.ON_PUSH_PEER_KEY in key:
                        self.on_push_handle(hk, data)

                        # logger('\n\n\n +++')
                        self.on_pushed_ip4_peer(data, hk_int=key)
                        # logger('\n\n\n +++')
                        # event handler here
                        return self.store.__setitem__(key, owner_signature_value)
                    else:
                        # logger('VAL SIG FAILED')
                        pass
                else:
                    pass
                    # logger('ERR ert:pubkey not found')
            else:
                # logger('NO PUB KEY FOUND')
                pass

    # local pull

    def pull(self, hk):
        # logger('STORE HANDLER PULL', hk)
        logger('LOCAL PULL DATA', hk)

        t = self.store.get(hk)
        if t:
            try:
                pk_owner, pk_signature, pk_value = self.store.get(hk)
                revision, data = cdx.decode_bson_val(pk_value)
                # # logger(data, data[self.ON_PUSH_PEER_KEY])
                self.on_pull_handle(hk, data)
                if self.ON_PUSH_GUID_KEY in data:
                    # logger('\n\n\n GUIDS REQUESTED \n\n\n')
                    v = data[self.ON_PUSH_GUID_KEY]
                    # logger(v)
                    return

                if self.ON_PUSH_PEER_KEY in data:
                    # self.dhf.pus
                    v = data[self.ON_PUSH_PEER_KEY]
                    host = v['h']
                    port = v['p']
                    # logger('\n \n \n \n \n + + @ SEND PEER TO BOOT', host, port)
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
                            # logger('ERROR bootstaraping peers to requester', str(e))
                            pass
                    return
                    #? todo return ?
            except Exception as e:
                # logger('ON PULL DECODING FAIL', str(e))
                pass
        if not t:
            self.on_pull_handle(hk, dict())
        return self.store.get(hk)

    def __contains__(self, hk):
        # logger('STORE HANDLE contains', hk)
        return self.store.__contains__(hk)

    def iter(self):
        # logger('STORE HANDLER ITERATOR')
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
                # logger('HK PUBKEY NOT FOUND, STORE INTEGRITY ERR')
                pass
        else:
            # event handler here
            # logger('PUBKEY NOT FOUND, TRIGGER PULL HERE')
            pass

