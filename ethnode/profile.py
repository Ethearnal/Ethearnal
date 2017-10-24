from randomavatar.randomavatar import Avatar
import os
import sys
import json
import random
import string
import config
from toolkit import tools
import io


import cherrypy


def none_cls():
    return None

def blank_st_cls():
    return ''

def empty_ls_cls():
    return list()


class EthearnalProfileModel(object):
    SPEC_PREFIX = 'spe'
    dict_cls = dict
    list_cls = list
    none_cls = none_cls

    FIELDS_SPEC = {
        'first': ('text', 'UTF-8', blank_st_cls),
        'last': ('text', 'UTF-8', blank_st_cls),
        'title': ('text', 'UTF-8', blank_st_cls),
        'skills': ('list', 'text', empty_ls_cls),
    }

    first = ''
    last = ''
    title = ''
    skills = []

    @classmethod
    def get_class(cls):
        return cls

    def to_dict(self):
        # todo key and val codecs
        cls = self.get_class()
        d = self.dict_cls()
        for k in cls.FIELDS_SPEC:
            mtype, codec, default_class = cls.FIELDS_SPEC[k]
            # print(k, '=', mtype, codec, default_class)
            v = getattr(self, k, default_class())
            d[k] = v
        return d

    def from_dict(self, d):
        # todo key and val codecs
        cls = self.get_class()
        for k in cls.FIELDS_SPEC:
            mtype, codec, default_class = cls.FIELDS_SPEC[k]
            if k in d:
                setattr(self, k, d[k])
        return self

    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False)

    def from_json_st(self, st):
        d = json.loads(st, ensure_ascii=False)
        return self.from_dict(d)

    def from_json_file(self, json_file):
        with open(json_file) as fs:
            d = json.load(fs)
        if not d:
            raise ValueError('Deserialize of %s failed!' % json_file)
        return self.from_dict(d)

    def to_json_file(self, json_file):
        with open(json_file, 'w') as fs:
            json.dump(self.to_dict(), fs, ensure_ascii=False)


class EthearnalProfileController(object):
    '''
    Carry about profile stuff
    '''
    PERSONAL_DIRECTORY_NAME = 'personal'
    PROFILE_JSON_FILE_NAME = 'profile.json'
    PROFILE_HTML_FILE_NAME = 'profile.html'
    PROFILE_IMAGE_FILE_NAME = 'profile_img.png'

    def __init__(self, data_dir=config.data_dir, personal_dir=None):
        self.data_dir = os.path.abspath(data_dir)
        if personal_dir:
            self.personal_dir = os.path.abspath(personal_dir)
        else:
            self.personal_dir = os.path.abspath('%s/%s' % (self.data_dir, self.PERSONAL_DIRECTORY_NAME))
            tools.mkdir(self.personal_dir)

        self.profile_json_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_JSON_FILE_NAME)
        self.profile_html_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_HTML_FILE_NAME)
        self.profile_image_file_name = '%s/%s' % (self.personal_dir, self.PROFILE_IMAGE_FILE_NAME)
        self.model = EthearnalProfileModel()

        # create empty profile if not found
        if not os.path.isfile(self.profile_json_file_name):
            self.model.to_json_file(self.profile_json_file_name)
        else:
            self.model.from_json_file(self.profile_json_file_name)

        # create empty profile html if not found
        if not os.path.isfile(self.profile_html_file_name):
            # todo
            pass
        else:
            # todo
            pass

        # create generated avatar if not found
        if not os.path.isfile(self.profile_image_file_name):
            self.generate_random_avatar(filename=self.profile_image_file_name)

    def get_profile_image_bytes(self):
        bts = None
        with open(self.profile_image_file_name, 'rb') as fs:
            bts = fs.read()
        return bts

    @staticmethod
    def generate_random_avatar(filename=None, n=10):
        if not filename:
            raise ValueError('Please set a file path where to save generated avatar')
        st = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(n))
        avatar = Avatar(rows=13, columns=13)
        image_byte_array = avatar.get_image(string=st,
                                            width=89,
                                            height=89,
                                            pad=10)

        return avatar.save(image_byte_array=image_byte_array,
                           save_location=filename)
    @property
    def data(self):
        return self.model.from_json_file(self.profile_json_file_name).to_json()


class EthearnalProfileView(object):
    exposed = True

    def __init__(self, profile_dir_abs):
        self.profile_dir_abs = profile_dir_abs
        self.profile = EthearnalProfileController(profile_dir_abs)
        self.query_dispatch = {
            'avatar': self.avatar,
            'data': self.data,
            'html': self.html,
            'guid': self.guid,
        }

    def GET(self, q):
        # todo fix this keep profile in object
        if q in self.query_dispatch:
            return self.query_dispatch[q]()
        else:
            return 'todo: 404'

    def avatar(self):
        cherrypy.response.headers['Content-Type'] = "image/png"
        fs = io.BytesIO(self.profile.get_profile_image_bytes())
        fs.seek(0)
        return cherrypy.lib.file_generator(fs)

    def data(self):
        return self.profile.data

    def html(self):
        if not os.path.isfile(self.profile.profile_html_file_name):
            return "" # todo 404

        bts = None
        with open(self.profile.profile_html_file_name, 'rb') as fp:
            fs = io.BytesIO(fp.read())
            fs.seek(0)
        return cherrypy.lib.file_generator(fs)

    def guid(self):
        import hashlib
        return hashlib.sha256(self.profile.data.encode('utf-8')).hexdigest()
        



