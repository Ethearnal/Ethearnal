import cherrypy
import json


class ApplicationJsonCodec(object):
    @staticmethod
    def encode(o):
        return json.dumps(o, ensure_ascii=False).encode(encoding='utf-8')

    @staticmethod
    def decode(bts: bytes):
        return json.loads(bts.decode(encoding='utf-8'))


class LResCollections(object):
    def __init__(self):
        self.collections = dict()
        self.content_types = dict()
        self.codecs = {
            'application/json': ApplicationJsonCodec()
        }

    def list_keys(self):
        return list(self.collections.keys())

    def list_values(self):
        return list(self.collections.values())

    def get(self, collection_name: str, resource_name: str='values'):
        content_type = self.content_types.get(collection_name)
        if resource_name == 'keys':
            data = self.list_keys()
        elif resource_name == 'values':
            data = self.list_values()
        else:
            data = self.collections.get((collection_name, resource_name))

        if not content_type:
            st = 'not found content type %s' % content_type
            return st.encode(encoding='utf-8')
        else:
            codec = self.codecs.get(content_type)
            if not codec:
                st = 'err unsupported codec for content type % s' % content_type
                return st.encode(encoding='utf-8')

            cherrypy.response.headers.__setitem__('Content-Type', content_type)
            try:
                return codec.encode(data)
            except:
                return b'404 encode err'

    def set(self, content_type: str, collection_name: str, resource_name: str, data: bytes):
        # data = self.collections.get((collection_name, resource_name))
        if resource_name == 'keys' or resource_name == 'values':
            return b'200'
        codec = self.codecs.get(content_type)
        if not codec:
            st = 'err unsipoorted codec for content type % s' % content_type
            return st.encode(encoding='utf-8')
        else:
            try:
                data = codec.decode(data)
            except:
                return b'404 decode err'
            self.content_types.__setitem__(collection_name, content_type)
            self.collections.__setitem__((collection_name, resource_name), data)
            return b'201 created'


class LResHandler(object):
    def __init__(self, collections):
        self.collections = collections

    def handle_get(self, collection_name, resource_name):
        item_data = self.collections.get(collection_name, resource_name)
        return item_data

    def handle_post(self, content_type, collection_name, resource_name, body):
        r = self.collections.set(content_type, collection_name, resource_name, body)
        return r

    def handle_patch(self, content_type, collection_name, resource_name, body):
        st = 'handle_patch %s %s %s' % (content_type, collection_name, resource_name)
        return st.encode(encoding='utf-8')

    def handle_delete(self, content_type, collection_name, resource_name):
        st = 'delete %s %s %s' % (content_type, collection_name, resource_name)
        st.encode(encoding='utf-8')
        return b'200 deleted'


class LResView(object):
    exposed = True

    def __init__(self, handler: LResHandler):
        self.handler = handler

    @cherrypy.popargs('collection_name', 'resource_name')
    def GET(self,  collection_name, resource_name=None):
        r = self.handler.handle_get(collection_name=collection_name,
                                    resource_name=resource_name)
        return r

    @cherrypy.popargs('collection_name', 'resource_name')
    def POST(self, collection_name, resource_name=None):
        content_type = cherrypy.request.headers.get('Content-Type')
        body = cherrypy.request.body.read()
        r = self.handler.handle_post(content_type=content_type,
                                     collection_name=collection_name,
                                     resource_name=resource_name,
                                     body=body)
        return r

    @cherrypy.popargs('collection_name', 'resource_name')
    def DELETE(self, collection_name, resource_name):
        content_type = cherrypy.request.headers.get('Content-Type')
        r = self.handler.handle_delete(content_type=content_type,
                                       collection_name=collection_name,
                                       resource_name=resource_name)
        return r

    @cherrypy.popargs('collection_name', 'resource_name')
    def PATCH(self, collection_name, resource_name):
        body = cherrypy.request.body.read()
        content_type = cherrypy.request.headers.get('Content-Type')
        r = self.handler.handle_patch(content_type=content_type,
                                      collection_name=collection_name,
                                      resource_name=resource_name,
                                      body=body)
        return r

    def PUT(self, res_type, collection_name, resource_name):
        return self.PATCH(res_type, collection_name, resource_name)

    @classmethod
    def mount(cls):
        cherrypy.tree.mount(cls(LResHandler(LResCollections())),
                            '/api/v1/lr/',
                            {'/': {
                                    'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                                    'tools.sessions.on': True,
                                    }
                            })
