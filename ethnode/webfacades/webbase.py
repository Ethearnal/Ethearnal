#import cherrypy


class WebApiBase(object):
    exposed = True

    def __init__(self, mount_point, cherry=None, mount_it=True):
        self.mount_point = mount_point
        self.cherry = cherry
        if mount_it:
            self.mount()

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                'tools.sessions.on': True,
            }
        }
    )