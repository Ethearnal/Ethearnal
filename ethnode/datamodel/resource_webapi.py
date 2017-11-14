import cherrypy


class LResHandler(object):

    def get_json_list(self,collection_name):
        pass

    def get_json_item(self,collection_name, resource_name):
        pass

    def get_file_list(self, collection_name):
        pass

    def get_file_item(self, collection_name, resource_name):
        pass

    def get(self, res_typ, collection_name, resource_name):
        return b''

    def post(self, res_typ, collection_name, resource_name):
        return b''


class LResView(object):
    exposed = True

    def __init__(self):
        pass

    @cherrypy.popargs('res_type', 'collection_name', 'resource_name')
    def GET(self, res_type, collection_name, resource_name=''):
        rs = '%s %s, %s' % (res_type, collection_name, resource_name)
        return rs.encode(encoding='utf-8')

    @cherrypy.popargs('res_type', 'collection_name', 'resource_name')
    def POST(self, res_type, collection_name, resource_name=''):
        body = cherrypy.request.body.read()
        print(body)
        rs = '%s %s, %s %s' % (res_type, collection_name, resource_name, body)
        return rs.encode(encoding='utf-8')

    @classmethod
    def mount(cls):
        cherrypy.tree.mount(cls(),
                            '/api/v1/lr/',
                            {'/': {
                                    'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                                    'tools.sessions.on': True,
                                    'tools.response_headers.on': True,
                                    'tools.response_headers.headers': [('Content-Type', 'text/plain')],
                                    }
                            })
