import requests
import traceback
from ertcdn.resource_model import SignedBinResource
from ertcdn.resource_web_service import ResourceFieldsMeta as RM
from ertcdn.resource_web_service import ResourceBsonCodec
from ertcdn.resource_api_interface import CdnBinResourceApiInterface


class CdnBinResourceBsonApiClientRequests(CdnBinResourceApiInterface):

    def __init__(self,
                 endpoint_host: str,
                 endpoint_port: str,
                 endpoint_path: str,
                 codec=ResourceBsonCodec()):

        self.codec = codec
        self.endpoint_host = endpoint_host
        self.endpoint_port = endpoint_port
        self.endpoint_path = endpoint_path

    def endpoint_url(self, hex_hash: str=None):
        if len(self.endpoint_path) >= 1:
            if self.endpoint_path[0] == '/':
                self.endpoint_path = self.endpoint_path[1:]
        if hex_hash:
            return 'http://%s:%s/%s/%s' % (self.endpoint_host,
                                           self.endpoint_port,
                                           self.endpoint_path,
                                           hex_hash)
        else:
            return 'http://%s:%s/%s' % (self.endpoint_host,
                                        self.endpoint_port,
                                        self.endpoint_path)

    def read(self, pk_hex_hash: str) -> SignedBinResource:
        try:
            resp = requests.get(self.endpoint_url(pk_hex_hash))
            res = SignedBinResource()
            if resp.status_code == 200:
                # ct = resp.headers.get('Content-Type')
                # ce = resp.headers.get('Content-Encoding')
                # if ct and ce:
                d = self.codec.decode(resp.content)
                if d:
                    res.data_bin = d[RM.DATA]
                    res.content_type_str = d[RM.CONTENT_TYPE]
                    res.content_encoding_str = d[RM.CONTENT_ENCODING]
                    res.owner_bin = d[RM.OWNER_HASH]
                    if RM.ORG_RES_HASH in d:
                        res.orig_res_hash = d[RM.ORG_RES_HASH]
                    res.pk_hex = pk_hex_hash
                    return res
                else:
                    print('fail no content_type and/or content_encoding')
            else:
                print('fail request response != 200', resp.status_code)
        except:
            print('fail GET request exception')
            traceback.print_exc()

    def create_from_dict(self, d: dict):
        try:
            body = self.codec.encode(d)
            if body:
                resp = requests.post(self.endpoint_url(), data=body)
                if resp.status_code == 201:
                    return resp.content.decode(encoding='utf-8')
                else:
                    print('fail request resp != 201')
        except:
            print('fail POST request exception')
            traceback.print_exc()

    def create(self, res: SignedBinResource) -> str:
        d = dict()
        d[RM.CONTENT_ENCODING] = res.content_encoding
        d[RM.CONTENT_TYPE] = res.content_type
        d[RM.OWNER_HASH] = res.owner_bin
        d[RM.DATA] = res.data_bin
        d[RM.DATA_SIG] = res.data_bin
        pk_hash_hex = self.create_from_dict(d)
        return pk_hash_hex


cdx = ResourceBsonCodec()


def d_data():
    d = dict()
    d[RM.CONTENT_TYPE] = b'application/json'
    d[RM.CONTENT_ENCODING] = b'identity'
    d[RM.DATA] = b'{[1]}'
    d[RM.DATA_SIG] = b'test-data-sig'
    d[RM.OWNER_HASH] = b'test-data-owner'
    return d


def test_bson(c=cdx, d=d_data()):
    return c.encode(d)


data = test_bson()


def default_local():
    return CdnBinResourceBsonApiClientRequests(
        endpoint_host='127.0.0.1',
        endpoint_port='5678',
        endpoint_path='/api/v1/res',
    )


cli = default_local()
