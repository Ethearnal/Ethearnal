import json
import bson
import datetime

from kadem.kad import DHTFacade
from kadem.kad import DHT
from ert_profile import EthearnalProfileController
from helpers.wordnet_parser import WordnetParser, GigGeneratorWordnet, ImagesFromCdnData
from webdht.double_linked import DList, instance_dl
from webdht.wdht import HashIO, OwnerGuidHashIO


class DHTProfile(object):
    FIELDS = ('description', 'title', 'skills', 'languages', 'name', 'headlinePicture', 'profilePicture')

    def __init__(self, dhf: DHTFacade):
        self.dhf = dhf

    def push(self, profile_key, data):
        key = {'profile:key': profile_key}
        value = {'k': key, 'v': data}
        self.dhf.push(key, value)

    def pull(self, profile_key):
        key = {'profile:key': profile_key}
        t = self.dhf.pull_local(key)
        if t:
            d = bson.loads(t[-1])
            if 'e' in d:
                ll = d['e']
                if len(ll) >= 1:
                    dd = ll[1]
                    if 'v' in dd:
                        return dd['v']

    @property
    def description(self):
        return self.pull('description')

    @description.setter
    def description(self, data):
        self.push('description', data)

    @property
    def title(self):
        return self.pull('title')

    @title.setter
    def title(self, data):
        self.push('title', data)

    @property
    def skills(self):
        return self.pull('skills')

    @skills.setter
    def skills(self, data):
        self.push('skills', data)

    @property
    def languages(self):
        return self.pull('languages')

    @languages.setter
    def languages(self, data):
        self.push('languages', data)

    @property
    def name(self):
        return self.pull('name')

    @name.setter
    def name(self, data):
        self.push('name', data)

    @property
    def name_first(self):
        return self.name.get('first')

    @property
    def name_last(self):
        return self.name.get('last')

    @property
    def headline_img_hash(self):
        return self.pull('headlinePicture')

    @headline_img_hash.setter
    def headline_img_hash(self, data):
        self.push('headlinePicture', data)

    @property
    def profile_img_hash(self):
        return self.pull('profilePicture')

    @profile_img_hash.setter
    def profile_img_hash(self, data):
        self.push('profilePicture', data)


class DHTValueProtocol(object):
    def __call__(self, t=None):
        if not t:
            return None
        d = bson.loads(t[-1])
        if 'e' in d:
            l = d['e']
            if len(l) >= 2:
                v = l[1]
                if 'value' in v:
                    return v['value']
        return None


class DHTProfileCollection(object):

    def __init__(self, dhf: DHTFacade, collection_name: str):
        self.collection_name = '.' + collection_name + 's'  # '.gigs'
        self.dhf = dhf
        self.me = OwnerGuidHashIO(dhf.ert.rsa_guid_hex)
        self.delete_collection_name = '.deleted_' + collection_name  # '.deleted_gigs'
        self.my_items = instance_dl(self.dhf, self.me.hex(), self.collection_name)
        self.my_deleted_items = instance_dl(self.dhf, self.me.hex(), self.delete_collection_name)
        self.item_model = collection_name.title()
        self.value_protocol = DHTValueProtocol()

    def post(self, key, data):
        k = {self.collection_name: key + datetime.datetime.now().isoformat()}
        v = data
        data['model'] = self.item_model
        data['owner_guid'] = self.me.hex()
        o_item_hk = self.my_items.insert(key=k, value=v)
        return self.dhf.cdx.guid_int_to_hex(o_item_hk)

    def update(self, key, data):
        k = {self.collection_name: key}
        v = data
        o_item_hk = self.dhf.push(k, v)
        return self.dhf.cdx.guid_int_to_hex(o_item_hk)

    def get(self, key):
        k = {self.collection_name: key}
        raw = self.dhf.pull_local(k)
        v = self.value_protocol(raw)
        return v

    def repush(self, hkey):
        self.dhf.repush(hk_hex=hkey)

    def get_hk(self, hkey):
        raw = self.dhf.pull_local('', hk_hex=hkey)
        # print(raw)
        v = self.value_protocol(raw)
        return v


class ProfileJsonData(object):
    # ('description', 'title', 'skills', 'languages', 'name', 'headlinePicture', 'profilePicture')
    mapping = {
        'bio': 'description',
        'title': 'title',
        'skills': 'skills',
        'languages': 'languages',
        'headline_image_hash': 'headlinePicture',
        'profile_image_hash': 'profilePicture',
        'domain': 'category'
    }

    # description:str, title:str, skills:[str,str,str], languages:[str,str,str], headlinePicture:str, profilePicture:str, category:str


    def reload(self):
        with open(self.jsfn, 'r') as fp:
            self._data = json.load(fp)

    @property
    def data(self):
        return self._data

    def __init__(self,
                 json_file_name: str,
                 pro: DHTProfile
                 ):
        self._data = dict()
        self.jsfn = json_file_name
        self.pro = pro
        self.reload()

    def update(self):
        for left_k in self.mapping:
            if left_k in self._data:
                r_key = self.mapping[left_k]
                data_v = self._data[left_k]
                self.pro.push(r_key, data_v)
        if 'names' in self._data:
            spl = self._data['names'].split(' ')
            if len(spl) == 1:
                d = {'first': spl[0], 'last': ''}
                self.pro.push('name', d)
            elif len(spl) > 1:
                d = {'first': spl[0], 'last': " ".join(spl[1:])}
                self.pro.push('name', d)
            self.pro.push('name', self._data['names'])

    def push_gigs(self):
        pass


class GigsGenerator(object):
    def __init__(self):
        verbs_src = 'data_demo/txt_wordnet/data.verb'
        cdn_data_dir = 'data_demo/cdn1_d'
        wdn = WordnetParser(verbs_src)
        img = ImagesFromCdnData(cdn_data_dir)
        gen = GigGeneratorWordnet(wdn, img)
