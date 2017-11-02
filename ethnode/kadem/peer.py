import hashlib
import json
from .hashing import hash_function
from toolkit import kadmini_codec


class Peer(object):
    ''' DHT Peer Information'''

    def __init__(self, host, port, node_id, info):
        self.host, self.port, self.id, self.info = host, port, node_id, info

    def astriple(self):
        return self.host, self.port, self.id, self.info

    def asquad(self):
        return self.host, self.port, self.id, self.info

    def address(self):
        return self.host, self.port

    def __repr__(self):
        return repr(self.astriple())

    def _sendmessage_dht(self, message, sock=None, peer_id=None, peer_info=None, lock=None):
        message["peer_id"] = peer_id  # more like sender_id
        message["peer_info"] = peer_info
        encoded = json.dumps(message)
        # SEND_MESSAGE
        if sock:
            if lock:
                with lock:
                    sock.sendto(encoded.encode('ascii'), (self.host, self.port))
            else:
                sock.sendto(encoded.encode('ascii'), (self.host, self.port))

    def _sendmessage(self, message, sock=None, peer_id=None, peer_info=None, lock=None):
        print('+ ++ ++ SEND MESSAGE')
        encoded_msg = dict()
        for k in message:
            try:
                encoded_msg[kadmini_codec.encode(k)]=message[k]
            except KeyError:
                print('FAILED TO ENCODE', k)
        print(encoded_msg)
        self._sendmessage_dht(
            message,
            sock=sock,
            peer_id=peer_id,
            peer_info=peer_info,
            lock=lock)

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

    def store(self, key, value, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "store",
            "id": key,
            "value": value
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def find_node(self, id, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "find_node",
            "id": id,
            "rpc_id": rpc_id
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def found_nodes(self, id, nearest_nodes, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "found_nodes",
            "id": id,
            "nearest_nodes": nearest_nodes,
            "rpc_id": rpc_id
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def find_value(self, id, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "find_value",
            "id": id,
            "rpc_id": rpc_id
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)

    def found_value(self, id, value, rpc_id, socket=None, peer_id=None, peer_info=None, lock=None):
        message = {
            "message_type": "found_value",
            "id": id,
            "value": value,
            "rpc_id": rpc_id
        }
        self._sendmessage(message, socket, peer_id=peer_id, peer_info=peer_info, lock=lock)
