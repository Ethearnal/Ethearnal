import cherrypy
import os
import config
from toolkit.tools import mkdir


class EthearnalApiProfile(object):
    exposed = True
    CONF = {'/': {'request.dispatch': cherrypy.dispatch.MethodDispatcher()}}

    def __init__(self, profile_dir_abs):
        self.profile_dir_abs = profile_dir_abs

    def GET(self):
        file_name = '%s/profile.json' % self.profile_dir_abs
        if os.path.isfile(file_name):
            with open(file_name, 'r') as fp:
                return fp.read()
        else:
            return '{}'


class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        return "ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main(http_webdir: str=config.http_webdir,
         socket_host: str=config.http_socket_host,
         socket_port: int=config.http_socket_port,
         profile_dir: str=config.data_dir,
         files_dir_name='files'):
    files_dir = '%s/%s' % (profile_dir, files_dir_name)

    if not os.path.isdir(files_dir):
        print('Creating dir for static files')
        mkdir(files_dir)
    profile_dir_abs = os.path.abspath(profile_dir)
    site_conf = {
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
            'tools.staticdir.root': os.path.abspath(profile_dir_abs),
            'tools.staticdir.dir': files_dir_name,
        }
    }
    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port
    # Cache-Control:public, max-age=31536000
    cherrypy.response.headers['Cache-Control'] = 'public, max-age=5'

    cherrypy.tree.mount(EthearnalSite(), '/', site_conf)
    cherrypy.tree.mount(EthearnalApiProfile(profile_dir_abs), '/api/v1/profile', EthearnalApiProfile.CONF)

    cherrypy.engine.start()
    cherrypy.engine.block()


if __name__ == '__main__':
    main()

