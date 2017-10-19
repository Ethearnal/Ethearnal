import cherrypy
import os
import config
from toolkit.tools import mkdir


class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        return "ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main(http_webdir: str=config.http_webdir,
         socket_host: str=config.http_socket_host,
         socket_port: int=config.http_socket_port,
         profile_dir: str=config.data_dir,
         files_dir='files'):

    if not os.path.isdir(files_dir):
        print('Creating dir for static files')
        mkdir(files_dir)

    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/ui': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'index.html',
        },
        '/ui/files': {
            'tools.staticdir.on': True,
            'tools.staticdir.root': os.path.abspath(profile_dir),
            'tools.staticdir.dir': files_dir,
        }
    }
    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port
    cherrypy.quickstart(EthearnalSite(), '/', conf)


if __name__ == '__main__':
    main()

