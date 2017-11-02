import json

# original protocol
decode_map = (
    'message_type',
    'peer_id',
    'peer_info',
    'value',
    'id',
    'rpc_id',
    'nearest_nodes',
    'find_node',
    'found_nodes',
    'find_value',
    'found_value',
    'store',
    'ping',
    'pong',
)

# minify

encode_map = {k[1]: chr(97+k[0]) for k in enumerate(decode_map)}
decode_map = {chr(97 + k[0]): k[1] for k in enumerate(decode_map)}


def remap_keys_encode(d: dict):
    return {encode_map[k]: d[k] for k in d}


def remap_keys_decode(d: dict):
    return {decode_map[k]: d[k] for k in d}


def encode(d: dict):
    remap_d = remap_keys_encode(d)
    js = json.dumps(remap_d, ensure_ascii=True)
    bts = js.encode(encoding='ascii')
    return bts


def decode(bts: bytes):
    st = bts.decode(encoding='ascii')
    d = json.loads(st, encoding='ascii')
    remap_d = remap_keys_decode(d)
    return remap_d

