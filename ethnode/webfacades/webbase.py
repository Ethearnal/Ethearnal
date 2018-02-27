import cherrypy


class WebApiBase(object):
    exposed = True

    def __init__(self, mount_point, cherry=cherrypy, mount_it=True):
        self.mount_point = mount_point
        self.cherry = cherry
        if mount_it:
            self.mount()

    def mount(self):
        cherrypy.tree.mount(
            self,
            self.mount_point, {'/': {
                'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                'tools.sessions.on': True,
            }
            }
        )