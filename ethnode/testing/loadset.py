# import sys
# import requests
import json
from random import randint
from datamodel.resource_json import BinResourceLocalApi
# file_name = sys.argv[1]

js = '''
{"imageHash":"b3446e3e290b69f53413aa083e73650ab3e9b532d7b79ea75b62c064430a4d93",
"title":"",
"ownerAvatar":"",
"category":"",
"ownerName":"FirstName",
"experienceLevel":"",
"description":"",
"price":"9",
"date":[{"expire":"12/2017"}]}
'''

ownerAvatar="iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAiUlEQVRYR+2VMQ6AIBAEpbP0df7Iz/gf4zcs7TQUdpABEhJJhna5sDe3F8J2nM/0oxM0BNOQEMVVQhIiAqSPm6F1mZPN7ddNTVfpxYQ0RFwlNBwhMlyr5yJQvGW1D9J9DUmICJBuhiKhHIWo5T7lrmuvodbgOrKPnBmiDLXoXddeQy0EqMaREaEXGI+c5+gVaN0AAAAASUVORK5CYII="


class TestGigGenerator(object):
    def __init__(self, fname, gigs_api: BinResourceLocalApi):
        self.fname = fname
        self.d = json.loads(js)
        self.gigs_api = gigs_api
        self.tweets = list()

    def gen(self, cnt=10000):
        c=0
        with open(self.fname, 'r') as fp:
            for line in fp.readlines():
                c += 1
                l = eval(line)
                img_url = l[-3]
                author = l[-5]
                tweet = l[3]
                self.d['ownerAvatar'] = ownerAvatar
                self.d['title'] = tweet
                if len(author) >= 1:
                    self.d['ownerName'] = author[0]
                    self.d['description'] = author[0]
                self.d['price'] = randint(1, 1000)


                js_data = json.dumps(self.d, ensure_ascii=False)
                js_bin_data = js_data.encode()
                self.tweets.append(js_bin_data)
                # print(img)
                # print(author)
                # print(tweet)
                if c == cnt:
                    break

    def range(self, fr, to):
        for k in self.tweets[fr:to]:
            self.gigs_api.create(js_data=k)




