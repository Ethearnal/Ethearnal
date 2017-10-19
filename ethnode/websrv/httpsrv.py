import cherrypy
import os


class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        return "ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main(http_webdir: str='webdoc',
         socket_host: str='127.0.0.1',
         socket_port: int=4567):
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/ui': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'index.html',
        }
    }
    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port
    cherrypy.quickstart(EthearnalSite(), '/', conf)


if __name__ == '__main__':
    main()

