import json
import random
import socket
import socketserver
import threading
import time
from .bucketset import BucketSet
# from .hashing import hash_function, random_id
# from .hashing import random_id
from toolkit.kadmini_codec import hash_function
from .peer import Peer
# from .storage import Shelve
from .shortlist import Shortlist
from . import hashing
from toolkit import kadmini_codec

# todo hm mh
k = 20

alpha = 3

# id_bits = 128

id_bits = kadmini_codec.id_bits

iteration_sleep = 1



class DHTFacade(object):
    def __init__(self, dht):
        self.dht = dht

    @property
    def peers(self):
        return self.dht.peers()

    def localdata(self):
        return self.dht.data


class DHTRequestHandler(socketserver.BaseRequestHandler):
    def handle_dht(self, message, message_type):
        # todo make it in dict or something, some general protocol handler
        try:
            # message = json.loads(self.request[0].decode('utf-8').strip())
            # message_type = message["message_type"]

            # handle message receive

            if message_type == "ping":
                self.handle_ping(message)
            elif message_type == "pong":
                self.handle_pong(message)
            elif message_type == "find_node":
                self.handle_find(message)
            elif message_type == "find_value":
                self.handle_find(message, find_value=True)
            elif message_type == "found_nodes":
                self.handle_found_nodes(message)
            elif message_type == "found_value":
                self.handle_found_value(message)
            elif message_type == "store":
                self.handle_store(message)
            elif message_type == "pubkey":
                self.pubkey(message)

        except KeyError:
            pass
        except ValueError:
            pass
        client_host, client_port = self.client_address
        peer_id = kadmini_codec.guid_bts_to_int(message["peer_id"])
        # peer_info = message["peer_info"] # disabled in protocol
        peer_info = None
        new_peer = Peer(client_host, client_port, peer_id, peer_info)
        self.server.dht.buckets.insert(new_peer)

    def pubkey(self, message):
        der = message['pubkey']
        print('HANDLE PUBKEY')

    def handle_ping(self, message):
        client_host, client_port = self.client_address
        id = kadmini_codec.guid_bts_to_int(message["peer_id"])
        #  info = message["peer_info"] # diabled in protocol
        info = None
        peer = Peer(client_host, client_port, id, info)
        peer.pong(socket=self.server.socket, peer_id=self.server.dht.peer.id, lock=self.server.send_lock)

    def handle_pong(self, message):
        pass

    def handle_find(self, message, find_value=False):
        key = kadmini_codec.guid_bts_to_int(message["id"])

        id = kadmini_codec.guid_bts_to_int(message["peer_id"])

        msg_rpc_id_int = kadmini_codec.guid_bts_to_int(message["rpc_id"])

        # try to make int bins
        #

        # info = message["peer_info"]
        info = None
        client_host, client_port = self.client_address
        peer = Peer(client_host, client_port, id, info)
        response_socket = self.request[1]
        if find_value and (key in self.server.dht.data):
            value = self.server.dht.data[key]

            peer.found_value(id, value, msg_rpc_id_int, socket=response_socket, peer_id=self.server.dht.peer.id,
                             peer_info=self.server.dht.peer.info, lock=self.server.send_lock)
        else:
            nearest_nodes = self.server.dht.buckets.nearest_nodes(id)
            if not nearest_nodes:
                nearest_nodes.append(self.server.dht.peer)
            nearest_nodes = [nearest_peer.astriple() for nearest_peer in nearest_nodes]
            peer.found_nodes(id, nearest_nodes, msg_rpc_id_int, socket=response_socket,
                             peer_id=self.server.dht.peer.id, peer_info=self.server.dht.peer.info,
                             lock=self.server.send_lock)

    def handle_found_nodes(self, message):
        msg_rpc_id_int = kadmini_codec.guid_bts_to_int(message["rpc_id"])
        rpc_id = msg_rpc_id_int

        shortlist = self.server.dht.rpc_ids[rpc_id]
        del self.server.dht.rpc_ids[rpc_id]
        # nearest_nodes = [Peer(*peer) for peer in message["nearest_nodes"]]
        decoded_nearest_nodes = list()
        for item in message['nearest_nodes']:
            ip4, port, id_bts = item
            decoded_nearest_nodes.append((ip4, port, kadmini_codec.guid_bts_to_int(id_bts)))
        shortlist.update(decoded_nearest_nodes)

    def handle_found_value(self, message):
        rpc_id = kadmini_codec.guid_bts_to_int(message["rpc_id"])
        shortlist = self.server.dht.rpc_ids[rpc_id]
        del self.server.dht.rpc_ids[rpc_id]
        shortlist.set_complete(message["value"])

    def handle_store(self, message):
        key = kadmini_codec.guid_bts_to_int(message["id"])
        self.server.dht.data[key] = message["value"]

# handle receive of all udp msg here


class EthDHTRequestHandle(DHTRequestHandler):
    def handle(self):
        message = kadmini_codec.decode(self.request[0])
        message_type = message["message_type"]
        # todo impl logging
        # print('+ + ++  HANDLE UDP MSG', message)
        self.handle_dht(message, message_type)

class DHTServer(socketserver.ThreadingMixIn, socketserver.UDPServer):
    def __init__(self, host_address, handler_cls):
        socketserver.UDPServer.__init__(self, host_address, handler_cls)
        self.send_lock = threading.Lock()
        self.socketserver = socketserver




class DHT(object):
    def __init__(self, host, port, guid=None, seeds=[], storage={}, info={},
                 requesthandler=EthDHTRequestHandle):
        if not guid:
            raise ValueError('GUID must SET from PUBLIC KEY!')
        self.storage = storage
        self.info = info

        # self.hash_function = hashing.hash_function

        self.hash_function = kadmini_codec.hash_function
        self.peer = Peer(host, port, guid, info)
        self.data = self.storage
        self.buckets = BucketSet(k, id_bits, self.peer.id)
        self.rpc_ids = {}  # should probably have a lock for this
        self.rpc_ids = {}  # should probably have a lock for this
        self.server = DHTServer(self.peer.address(), requesthandler)
        self.server.dht = self
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.daemon = True
        self.server_thread.start()
        self.bootstrap(seeds)


    @property
    def identity(self):
        return self.peer.id

    def iterative_find_nodes(self, key, boot_peer=None):
        shortlist = Shortlist(k, key)
        shortlist.update(self.buckets.nearest_nodes(key, limit=alpha))
        if boot_peer:
            rpc_id = random.getrandbits(id_bits)
            self.rpc_ids[rpc_id] = shortlist
            boot_peer.find_node(key, rpc_id, socket=self.server.socket, peer_id=self.peer.id, peer_info=self.peer.info)
        while (not shortlist.complete()) or boot_peer:
            nearest_nodes = shortlist.get_next_iteration(alpha)
            for peer in nearest_nodes:
                shortlist.mark(peer)
                rpc_id = random.getrandbits(id_bits)
                self.rpc_ids[rpc_id] = shortlist
                peer.find_node(key, rpc_id, socket=self.server.socket, peer_id=self.peer.id,
                               peer_info=self.info)  ######
            time.sleep(iteration_sleep)
            boot_peer = None
        return shortlist.results()

    def iterative_find_value(self, key):
        shortlist = Shortlist(k, key)
        shortlist.update(self.buckets.nearest_nodes(key, limit=alpha))
        while not shortlist.complete():
            nearest_nodes = shortlist.get_next_iteration(alpha)
            for peer in nearest_nodes:
                shortlist.mark(peer)
                rpc_id = random.getrandbits(id_bits)
                self.rpc_ids[rpc_id] = shortlist
                peer.find_value(key, rpc_id, socket=self.server.socket, peer_id=self.peer.id,
                                peer_info=self.info)  #####
            time.sleep(iteration_sleep)
        return shortlist.completion_result()

    # Return the list of connected peers
    def peers(self):
        return self.buckets.to_dict()

    # Boostrap the network with a list of bootstrap nodes
    def bootstrap(self, bootstrap_nodes=[]):
        for bnode in bootstrap_nodes:
            boot_peer = Peer(bnode[0], bnode[1], "", "")
            self.iterative_find_nodes(self.peer.id, boot_peer=boot_peer)

        if len(bootstrap_nodes) == 0:
            for bnode in self.buckets.to_list():
                self.iterative_find_nodes(self.peer.id, boot_peer=Peer(bnode[0], bnode[1], bnode[2], bnode[3]))

    # Get a value in a sync way, calling an handler
    def get_sync(self, key, handler):
        try:
            d = self[key]
        except:
            d = None

        handler(d)

    # Get a value in async way
    def get(self, key, handler):
        # print ('dht.get',key)
        t = threading.Thread(target=self.get_sync, args=(key, handler))
        t.start()

    # Iterator
    def __iter__(self):
        return self.data.__iter__()

    # Operator []
    def __getitem__(self, key):
        # todo heavy refactor here
        if isinstance(key, int):
            hashed_key = key
        else:
            hashed_key = self.hash_function(key)

        if hashed_key in self.data:
            return self.data[hashed_key]
        result = self.iterative_find_value(hashed_key)
        if result:
            self.data[hashed_key] = result
            r = self.data[hashed_key]
            return r
        raise KeyError

    def set_hashed(self, hashed_key, value):
        # if not nearest_nodes:
        self.data[hashed_key] = value
        nearest_nodes = self.iterative_find_nodes(hashed_key)
        for node in nearest_nodes:
            node.store(hashed_key, value, socket=self.server.socket, peer_id=self.peer.id)

    # Operator []=
    def __setitem__(self, key, value):
        hashed_key = self.hash_function(key)
        self.set_hashed(hashed_key, value)

    def cast_set(self):
        for hashed_key in self.data:
            self.set_hashed(hashed_key, self.data[hashed_key])

    def tick(self):
        pass



