#import cherrypy


class WebApiBase(object):
    exposed = True

    def __init__(self, mount_point, cherry=None, mount_it=True):
        self.mount_point = mount_point
        self.cherry = cherry
        if mount_it:
            self.mount()

    def set_cors_headers(self):
        self.cherry.response.headers['Access-Control-Allow-Methods'] = 'PUT POST GET'
        self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
        self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                'tools.sessions.on': True,
            }
        }
    )