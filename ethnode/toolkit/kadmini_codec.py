import json
import hashlib
import binascii
import bson
import rsa
from random import randint


DEFAULT_REVISION = 1

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
    'signature',
    # 'pubkey',
    # 'pubkey_der',
)

# todo impl detailed testing for all conversions

# minify

encode_map = {k[1]: chr(97+k[0]) for k in enumerate(decode_map)}
decode_map = {chr(97 + k[0]): k[1] for k in enumerate(decode_map)}


id_bits = 256
id_bytes_len = 32


def sign_message(bin_message, prv_der):
    prv = rsa.PrivateKey.load_pkcs1(prv_der, 'DER')
    sig = rsa.sign(bin_message, prv, 'SHA-256')
    return sig


def verify_guid(bin_guid, bin_pubkey):
    if bin_guid == hashlib.sha256(bin_pubkey).digest():
        return True
    else:
        return False


def verify_message(bin_message, signature, pub_der):
    pub = rsa.PublicKey.load_pkcs1(pub_der, 'DER')
    verified = rsa.verify(bin_message, signature, pub)
    return verified


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


def guid_bin_to_hex(binguid: bytes):
    return binascii.hexlify(binguid)


def guid_bin_to_hex2(binguid: bytes):
    return binascii.hexlify(binguid).decode()


def guid_hex_to_bin(hexguid: str):
    return binascii.unhexlify(hexguid)


def pub_der_guid_bts(pub_der: bytes):
    return hashlib.sha256(pub_der).digest()


def sha256_bin_digest(data: bytes):
    return hashlib.sha256(data).digest()


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
    return bts


def decode_js_ascii(bts: bytes):
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
    remap_d = remap_keys_encode(d)
    bts = bson.dumps(remap_d)
    return bts


def decode_bson(bts: bytes):
    d = bson.loads(bts)
    remap_d = remap_keys_decode(d)
    return remap_d


def encode(d: dict):
    return encode_bson(d)


def decode(bts: bytes):
    return decode_bson(bts)


def q4_quanta_to_bytes(q1: int, q2: int, q3: int, q4: int, sz=8, order='big'):
    b1 = q1.to_bytes(sz, order)
    b2 = q2.to_bytes(sz, order)
    b3 = q3.to_bytes(sz, order)
    b4 = q4.to_bytes(sz, order)
    b = b1 + b2 + b3 + b4
    return b


def composite_hash_sha256(b1: bytes, b2: bytes) -> bytes:
    b_comp = b1+b2
    sha = hashlib.sha256(b_comp)
    r = sha.digest()
    return r

