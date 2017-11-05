import json
import hashlib
import binascii
import bson




DEFAULT_REVISON = 1

revision_function = hex

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
    # extend
    'pubkey',
    'pubkey_der',
)

# todo impl detailed testing for all conversions

# minify

encode_map = {k[1]: chr(97+k[0]) for k in enumerate(decode_map)}
decode_map = {chr(97 + k[0]): k[1] for k in enumerate(decode_map)}


id_bits = 256
id_bytes_len = 32


def encode_key_hash(item_key, guid=b'1', revision=1):
    proto_dict = {'e': [revision, guid, item_key]}
    bson_enc = bson.dumps(proto_dict)
    hashed_key = hash_function(bson_enc)
    return hashed_key


def encode_val_bson(item_val, revision=1):
    proto_dict = {'e': [revision, item_val]}
    bson_enc = bson.dumps(proto_dict)
    return bson_enc


def decode_bson_val(bts):
    d = bson.loads(bts)
    revision, item_val = d['e']
    return revision, item_val


def guid_bts_to_int(guid_bts: bytes):
    return int(binascii.hexlify(guid_bts), 16)


def guid_int_to_bts(gudint: int):
    # todo support for other endianness ?
    return gudint.to_bytes(id_bytes_len, byteorder='big')


def guid_int_to_hex(guidint: int):
    bts = guid_int_to_bts(guidint)
    return binascii.hexlify(bts).decode(encoding='ascii')


def hash_function(bin_data):
    print('SHA256 HASHING')
    sha = hashlib.sha256(bin_data)
    dige = sha.digest()
    i = guid_bts_to_int(dige)
    return i


def remap_keys_encode(d: dict):
    return {encode_map[k]: d[k] for k in d}


def remap_keys_decode(d: dict):
    return {decode_map[k]: d[k] for k in d}


# json is std unicode but we need space

def encode_js_ascii(d: dict):
    remap_d = remap_keys_encode(d)
    js = json.dumps(remap_d, ensure_ascii=True, separators=(',', ':'))
    bts = js.encode(encoding='ascii')
    # print('ENCODED SZ', len(bts))
    return bts


def decode_js_ascii(bts: bytes):
    # print('try JS  to decode, + +++ d', bts)
    st = bts.decode(encoding='ascii')
    d = json.loads(st, encoding='ascii')
    remap_d = remap_keys_decode(d)
    return remap_d

# bsn encoding


def print_d(msg, d):
    print(msg)
    for k, v in d.items():
        print('  ', k, ' ->', v)


def encode_bson(d: dict):
    # print_d('encode ORIG', d)
    remap_d = remap_keys_encode(d)
    # print_d('encode SHORT', remap_d)
    bts = bson.dumps(remap_d)
    # print('ENCODE BTS',bts)
    return bts


def decode_bson(bts: bytes):
    d = bson.loads(bts)
    remap_d = remap_keys_decode(d)
    return remap_d


def encode(d: dict):
    return encode_bson(d)


def decode(bts: bytes):
    return decode_bson(bts)

