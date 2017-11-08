import hashlib
import json

from toolkit import kadmini_codec
from toolkit.kadmini_codec import hash_function

cdx = kadmini_codec


def print_d(msg, d):
    print(msg)
    for k, v in d.items():
        print('  ', k, ' ->', v)


class PeerC(object):
    def __new__(cls, *args, **kwargs):
        host = kwargs.pop('host')
        port = kwargs.pop('port')
        node_id = kwargs.pop('id')
        socket = kwargs.pop('socket')
        from_id = kwargs.pop('from_id')
        info = None
        return Peer(host, port, node_id, info, socket=socket, from_id=from_id)


class Peer(object):
    ''' DHT Peer Information'''

    def __init__(self, host, port, node_id, info,
                 socket=None, from_id=None):
        self.host, self.port, self.id, self.info = host, port, node_id, info
        self.socket = socket
        self.from_id = from_id

    def astriple(self):
        return self.host, self.port, self.id, self.info

    def asquad(self):
        # quad ?
        return self.host, self.port, self.id, self.info

    def address(self):
        return self.host, self.port

    def __repr__(self):
        return repr(self.astriple())

    def _sendmessage_dht(self, message, codec,
                         sock=None, peer_id=None, peer_info=None, lock=None):
        message["peer_id"] = peer_id  # more like sender_id
        bts = codec.encode(message)

        # todo, originally server socket is used for sending
        # todo refactor this asap

        if sock:
            if lock:
                with lock:
                    sock.sendto(bts, (self.host, self.port))
            else:
                sock.sendto(bts, (self.host, self.port))

    # handle send of all udp msg here
    def _sendmessage(self, message,
                     sock=None, peer_id=None, peer_info=None, lock=None):

        if not sock:
            sock = self.socket

        if isinstance(peer_id, int):
            peer_id = cdx.guid_int_to_bts(peer_id)

        self._sendmessage_dht(
            message,
            kadmini_codec,
            sock=sock,
            peer_id=peer_id,
            peer_info=peer_info,  # disable originally unused
            lock=lock,
        )

    def push_pubkey(self, sender_id=None, pubkey_der=None):
        if not sender_id:
            sender_id = self.from_id
        message = {
            "message_type": "pubkey",
            "pubkey_der": pubkey_der,
        }
        self._sendmessage(message, self.socket, peer_id=sender_id, peer_info=None, lock=None)

    def ping(self, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "ping"
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def pong(self, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "pong"
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def store(self, key, value, socket=None,
              peer_id=None,
              peer_info=None,
              lock=None,
              signature=None):
        key_bts = kadmini_codec.guid_int_to_bts(key)
        message = {
            "message_type": "store",
            "id": key_bts,
            "value": value
        }
        if signature:
            message['signature'] = signature
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def find_node(self, id, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        id_bts = kadmini_codec.guid_int_to_bts(id)
        rpc_id_bts = kadmini_codec.guid_int_to_bts(rpc_id)
        message = {
            "message_type": "find_node",
            "id": id_bts,
            "rpc_id": rpc_id_bts
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def found_nodes(self, id_int, nearest_nodes, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        # ip4, port, id, info
        id_bts = cdx.guid_int_to_bts(id_int)
        rpc_id_bts = cdx.guid_int_to_bts(rpc_id)
        for node in nearest_nodes:
            host, port, int_id, peer_info = node
            print(node, type(node))
            self.find_node(id_int, rpc_id)

        for node in nearest_nodes:
            ip4, port, id_int_nd, info = node
            id_bts_nd = cdx.guid_int_to_bts(id_int_nd)
            new_near_nodes = [(ip4, port, id_bts_nd), ]
            message = {
                "message_type": "found_nodes",
                "id": id_bts,
                "nearest_nodes": new_near_nodes,
                "rpc_id": rpc_id_bts
            }
            self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def find_value(self, id, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        print('SEND FIND_VALUE')
        id_bts = kadmini_codec.guid_int_to_bts(id)
        rpc_id_bts = kadmini_codec.guid_int_to_bts(rpc_id)
        message = {
            "message_type": "find_value",
            "id": id_bts,
            "rpc_id": rpc_id_bts
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def found_value(self, id, value, rpc_id,
                    socket=None, peer_id=None, peer_info=None, lock=None):
        print('SEND FOUND_VALUE')
        id_bts = kadmini_codec.guid_int_to_bts(id)
        rpc_id_bts = kadmini_codec.guid_int_to_bts(rpc_id)
        message = {
            "message_type": "found_value",
            "id": id_bts,
            "value": value,
            "rpc_id": rpc_id_bts
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)
