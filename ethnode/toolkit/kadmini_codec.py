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


encode_map = {k[1]: chr(97+k[0]).encode(encoding='ascii') for k in enumerate(decode_map)}
decode_map = {chr(97 + k[0]).encode(encoding='ascii'): k[1] for k in enumerate(decode_map)}


def encode(st: str):
    return encode_map[st]


def decode(bt):
    return decode_map[bt]
