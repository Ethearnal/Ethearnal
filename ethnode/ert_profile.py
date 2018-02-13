import os
import random
import string
import config
import io
import json
import cherrypy
import rsa
import hashlib
import base64

import ipgetter

from toolkit import tools
from toolkit import basemodel
from toolkit.store import CrudJsonListStore
from toolkit.store_sqlite import ErtDHTSQLite, ErtREFSQLite
from toolkit import kadmini_codec as cdx
from datamodel.resource_sqlite import ResourceSQLite
from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from datamodel.resource_plain_utf8 import PlainTextUTF8Resource, PlainTextUTF8ResourceKeyWordIndex
from datamodel.resource_plain_utf8 import PlainTextUTF8ResourcePrefixIndex
from datamodel.resource_plain_utf8 import PlainTextUTF8KeyWordIndexed, PlainTextUTF8PrefixIndexed
from datamodel.resource_plain_utf8 import PLainTextUTF8WebApi
from datamodel.resource_json import BinResource
from datamodel.resource_json import GigResourceWebLocalApi, BinResourceLocalApi
from datamodel.resource_json import GigsMyResourceWebLocalApi
from datamodel.resource_json import ImageResourceWebLocalApi, ResourceImagesWebLocalApi
from datamodel.resource_index import IndexApiBundle
from ertcdn.resource_web_client import CdnBinResourceBsonApiClientRequests

from crypto.signer import LocalRsaSigner

# from randomavatar.randomavatar import Avatar


class EthearnalProfileModel(basemodel.BaseModel):
    SPEC_PREFIX = 'spe'
    dict_cls = dict
    list_cls = list
    none_cls = basemodel.none_cls

    FIELDS_SPEC = {
        'first': ('text', 'UTF-8', basemodel.blank_st_cls),
        'last': ('text', 'UTF-8', basemodel.blank_st_cls),
        'title': ('text', 'UTF-8', basemodel.blank_st_cls),
        'nick': ('text', 'UTF-8', basemodel.blank_st_cls),
        'skills': ('list', 'text', basemodel.empty_ls_cls),
    }

    first = ''
    last = ''
    title = ''
    nick = ''
    skills = []

    def __init__(self):
        super(EthearnalProfileModel, self).__init__()


class EthearnalProfileController(object):
    '''
    Carry about profile stuff
    '''

    PERSONAL_DIRECTORY_NAME = 'personal'
    PROFILE_JSON_FILE_NAME = 'profile.json'
    PROFILE_HTML_FILE_NAME = 'profile.html'
    PROFILE_IMAGE_FILE_NAME = 'profile_img.png'
    JOB_POSTS_JSON_FILE_NAME = 'job_posts.json'
    PROFILE_DHT_SQLITE = 'dht.db'
    PROFILE_DHT_REF_PUBKEYS = 'pubkeys.db'
    DB_GIGS_IDX = 'gigs_idx.db'

    # abs
    # PROFILE_PREFIXES_IDX = 'plain_text_utf8_prefix_idx.db'
    # PROFILE_PLAIN_UTF8_TEXTS = 'plain_text_utf8.db'
    # PROFILE_MY_GIGS_INDEX = 'my_gigs_idx.db'
    # PROFILE_GIGS_DB = 'gigs.db'
    # PROFILE_IMGS_DB = 'imgs.db'

    RSA_PRV = 'rsa_id.prv'
    RSA_PUB = 'rsa_id.pub'
    RSA_FORMAT = 'PEM'

    def __init__(self,
                 data_dir=config.data_dir,
                 personal_dir=None,
                 # files_dir=None,
                 cdn_bootstrap_host=None,
                 cdn_bootstrap_port=None,
                 cdn_service_node=False,
                 ):
        self.cdn_service_node = cdn_service_node
        self.my_wan_ip = None
        self.my_lan_ip = None
        self.cdn_service_http_url = None
        # self.my_wan_port = 0
        self.cdx = cdx
        self.cdn_host = cdn_bootstrap_host
        self.cdn_port = cdn_bootstrap_port
        if not self.cdn_service_node:
            if not cdn_bootstrap_host and not cdn_bootstrap_port:
                raise ValueError('bootstrap to ertcdn service is required')

        # self.cdn_gigs = CdnBinResourceBsonApiClientRequests(endpoint_host=cdn_bootstrap_host,
        #                                                     endpoint_port=cdn_bootstrap_port,
        #                                                     endpoint_path='/api/v1/gig')
        #
        # self.cdn_imgs = CdnBinResourceBsonApiClientRequests(endpoint_host=cdn_bootstrap_host,
        #                                                     endpoint_port=cdn_bootstrap_port,
        #                                                     endpoint_path='/api/v1/img')

        self.data_dir = os.path.abspath(data_dir)

        if personal_dir:
            self.personal_dir = os.path.abspath(personal_dir)
        else:
            self.personal_dir = os.path.abspath('%s/%s' % (self.data_dir, self.PERSONAL_DIRECTORY_NAME))
            tools.mkdir(self.personal_dir)

        # if files_dir:
        #     self.files_dir = os.path.abspath(files_dir)
        # else:
        #     self.files_dir = os.path.abspath('%s/%s' % (self.data_dir, config.static_files))

        self.profile_json_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_JSON_FILE_NAME)
        self.profile_html_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_HTML_FILE_NAME)
        self.profile_image_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_IMAGE_FILE_NAME)

        self.rsa_prv_fn = '%s/%s' % (self.personal_dir, self.RSA_PRV)
        self.rsa_pub_fn = '%s/%s' % (self.personal_dir, self.RSA_PUB)
        self.dht_fb_fn = '%s/%s' % (self.personal_dir, self.PROFILE_DHT_SQLITE)
        self.dht_ref_pubkeys_fn = '%s/%s' % (self.personal_dir, self.PROFILE_DHT_REF_PUBKEYS)
        self.db_gigs_index_fn = '%s/%s' % (self.personal_dir, self.DB_GIGS_IDX)

        #  self.job_post_json_store_fn = '%s/%s' % (self.personal_dir, self.JOB_POSTS_JSON_FILE_NAME)
        # self.db_plain_text = '%s/%s' % (self.personal_dir, self.PROFILE_PLAIN_UTF8_TEXTS)
        # self.db_plain_text_inv = '%s/%s' % (self.personal_dir, self.PROFILE_PREFIXES_IDX)
        #
        # self.db_gigs = '%s/%s' % (self.personal_dir, self.PROFILE_GIGS_DB)
        # self.db_imgs = '%s/%s' % (self.personal_dir, self.PROFILE_IMGS_DB)
        # self.db_my_gigs_idx = '%s/%s' % (self.personal_dir, self.PROFILE_MY_GIGS_INDEX)

        # self.model = EthearnalProfileModel()

        self.dht_store = ErtDHTSQLite(self.dht_fb_fn)
        self.dht_pubkeys = ErtREFSQLite(self.dht_ref_pubkeys_fn)

        # create empty profile if not found
        # if not os.path.isfile(self.profile_json_file_name):
        #     self.model.to_json_file(self.profile_json_file_name)
        # else:
        #     self.model.from_json_file(self.profile_json_file_name)

        # create empty profile html if not found
        # if not os.path.isfile(self.profile_html_file_name):
        #     # todo
        #     pass
        # else:
        #     # todo
        #     pass

        # create generated avatar if not found
        # if not os.path.isfile(self.profile_image_file_name):
        #     self.generate_random_avatar(filename=self.profile_image_file_name)

        # create rsa keys if not present
        # todo win/ux chmod 400 secure keys
        self.rsa_keys()
        # init local signer
        self.rsa_signer = LocalRsaSigner(self.rsa_prv_der, self.rsa_pub_der)
        # self.plain_texts = PlainTextUTF8PrefixIndexed(
        #     rs=PlainTextUTF8Resource(signer=self.rsa_signer, data_store=ResourceSQLite(db_name=self.db_plain_text,
        #                                                                                table_name='plain_text')),
        #     inv=PlainTextUTF8ResourcePrefixIndex(data_store=InvIndexTimestampSQLite(db_name=self.db_plain_text_inv,
        #                                                                             table_name='plain_text_inv'))
        # )
        #
        # self.gigs_api = BinResourceLocalApi(
        #     jsr=BinResource(
        #         data_store=ResourceSQLite(
        #             db_name=self.db_gigs,
        #             table_name='gigs'),
        #         cdn_client=self.cdn_gigs,
        #         ),
        #     signer=self.rsa_signer,
        #
        # )
        #
        # self.dbeep = PLainTextUTF8WebApi(
        #     cherrypy=cherrypy,
        #     api=self.plain_texts,
        #     mount=True,
        # )
        #
        # self.gig_web_api = GigResourceWebLocalApi(
        #      cherrypy=cherrypy,
        #      api=self.gigs_api,
        #      mount=True,
        # )
        #
        # self.gigs_web_api = GigsMyResourceWebLocalApi(
        #     cherrypy=cherrypy,
        #     api=self.gigs_api,
        #     mount=True,
        # )
        #
        # self.img_api = BinResourceLocalApi(
        #     jsr=BinResource(
        #         data_store=ResourceSQLite(db_name=self.db_imgs, table_name='imgs'),
        #         cdn_client=self.cdn_imgs
        #     ),
        #     signer=self.rsa_signer
        # )
        #
        # self.img_web_api = ImageResourceWebLocalApi(
        #     cherrypy=cherrypy,
        #     api=self.img_api,
        #     mount=True
        # )
        #
        # self.imgs_web_api = ResourceImagesWebLocalApi(
        #     cherrypy=cherrypy,
        #     api=self.img_api,
        #     mount=True
        # )
        #
        # self.idx = IndexApiBundle(self.db_my_gigs_idx, self.gigs_api, cherrypy=cherrypy)
        # self.idx.text_web_api.mount()
        # self.idx.query_web_api_guids.mount()
        # self.idx.query_web_api_obj.mount()
        # self.idx.index_all_by_title_desc_web.mount()
        # self.gig_web_api.text_api = self.idx.text_api

    def get_profile_image_bytes(self):
        bts = None
        with open(self.profile_image_file_name, 'rb') as fs:
            bts = fs.read()
            fs.close()
        return bts

    # @staticmethod
    # def generate_random_avatar(filename=None, n=10):
    #     if not filename:
    #         raise ValueError('Please set a file path where to save generated avatar')
    #     st = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(n))
    #     avatar = Avatar(rows=13, columns=13)
    #     image_byte_array = avatar.get_image(string=st,
    #                                         width=89,
    #                                         height=89,
    #                                         pad=10)
    #
    #     return avatar.save(image_byte_array=image_byte_array,
    #                        save_location=filename)
    @property
    def data(self):
        return self.model.from_json_file(self.profile_json_file_name).to_json()

    def rsa_keys(self, key_sz=1024):
        have_prv = os.path.isfile(self.rsa_prv_fn)
        have_pub = os.path.isfile(self.rsa_pub_fn)

        if not have_prv and not have_pub:
            pubkey, prvkey = rsa.newkeys(key_sz)
            with open(self.rsa_prv_fn, 'wb') as fp_prv:
                fp_prv.write(prvkey.save_pkcs1(format=self.RSA_FORMAT))
                fp_prv.close()
                with open(self.rsa_pub_fn, 'wb') as fp_pub:
                    fp_pub.write(pubkey.save_pkcs1(format=self.RSA_FORMAT))
                    fp_pub.close()
            print('RSA KEYS GENERATED')

    @property
    def rsa_public_pem(self):
        with open(self.rsa_pub_fn, 'rb') as fp:
            bts = fp.read()
            b64, der = self.rsa_b64_der(bts)
            fp.close()
        return b64

    @staticmethod
    def rsa_b64_der(bts):
        cherrypy.response.headers['Content-Type'] = 'text/html; charset=ascii'
        st = str(bts, encoding='ascii')
        ln = st.splitlines()
        b64 = '\n'.join(ln[1:-1])
        der = base64.b64decode(b64)
        return b64, der

    @property
    def rsa_pub_b64_der(self):
        with open(self.rsa_pub_fn, 'rb') as fp:
            cherrypy.response.headers['Content-Type'] = 'text/html; charset=ascii'
            bts = fp.read()
            fp.close()
        b64, der = self.rsa_b64_der(bts)
        return b64, der

    def rsa_prv_obj(self):
        with open(self.rsa_prv_fn, 'rb') as fp:
            pem_bts = fp.read()
            fp.close()
        rsa.PrivateKey.load_pkcs1()


    @property
    def rsa_prv_b64_der(self):
        with open(self.rsa_prv_fn, 'rb') as fp:
            bts = fp.read()
            fp.close()
        b64, der = self.rsa_b64_der(bts)
        return b64, der

    @property
    def rsa_prv_der(self):
        return self.rsa_prv_b64_der[1]

    @property
    def rsa_pub_base64(self):
        return self.rsa_pub_b64_der[0]

    @property
    def rsa_pub_der(self):
        return self.rsa_pub_b64_der[1]

    @property
    def rsa_guid_hex_bin(self):
        b64, der = self.rsa_pub_b64_der
        sha = hashlib.sha256(der)
        hexd = sha.hexdigest()
        bts = sha.digest()
        return hexd, bts

    @property
    def rsa_guid_hex(self) -> str:
        return self.rsa_guid_hex_bin[0]

    @property
    def rsa_guid_int(self) -> int:
        return cdx.guid_bts_to_int(self.rsa_guid_bin)

    @property
    def rsa_guid_bin(self) -> bytes:
        return self.rsa_guid_hex_bin[1]

    def rsa_sign(self, bin_msg):
        return cdx.sign_message(bin_message=bin_msg, prv_der=self.rsa_prv_der)

    def rsa_verify(self, bin_msg, sig, pub_der=None):
        if not pub_der:
            pub_der = self.rsa_pub_der
        return cdx.verify_message(bin_msg, sig, pub_der)

