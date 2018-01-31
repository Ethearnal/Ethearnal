import json
import bson

from kadem.kad import DHTFacade
from kadem.kad import DHT
from ert_profile import EthearnalProfileController


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

