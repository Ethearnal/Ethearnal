import cherrypy
import os


class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        return "ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main(webdoc: str = 'webdoc'):
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/ui': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': webdoc,
            'tools.staticdir.index': 'index.html',
        }
    }
    cherrypy.quickstart(EthearnalSite(), '/', conf)

