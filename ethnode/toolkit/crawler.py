import requests


class Crawler(object):
    def __init__(self):
        pass

    def get(self, url):
        return requests.get(url)
