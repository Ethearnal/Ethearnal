import cherrypy
import os
import sys
import traceback
import config
import argparse
from toolkit.tools import mkdir
from eth_profile import EthearnalProfileView, EthearnalProfileController
from eth_profile import EthearnalJobView, EthearnalJobPostController
from eth_profile import EthearnalUploadFileView


parser = argparse.ArgumentParser(description='Ethearnal p2p node')

parser.add_argument('-l', '--http_host_port',
                    default=config.http_host_port,
                    help='E,g 127.0.0.1:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.data_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)

parser.add_argument('-w', '--http_webdir',
                    default=config.http_webdir,
                    help='Point ui html static dir',
                    required=False,
                    type=str)



class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        return "ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main(http_webdir: str=config.http_webdir,
         socket_host: str=config.http_socket_host,
         socket_port: int=config.http_socket_port,
         profile_dir: str=config.data_dir,
         files_dir_name=config.static_files):

    http_webdir = os.path.abspath(http_webdir)
    files_dir = os.path.abspath('%s/%s' % (profile_dir, files_dir_name))

    if not os.path.isdir(files_dir):
        print('Creating dir for static files')
        mkdir(files_dir)
    profile_dir_abs = os.path.abspath(profile_dir)
    e_profile = EthearnalProfileController(profile_dir_abs, files_dir=files_dir)

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
    # Cache-Control:public, max-age=5 # in seconds
    cherrypy.response.headers['Cache-Control'] = 'public, max-age=5'

    cherrypy.tree.mount(EthearnalSite(), '/', site_conf)
    #
    cherrypy.tree.mount(EthearnalProfileView(e_profile),
                        '/api/v1/profile',
                        {'/': {'request.dispatch': cherrypy.dispatch.MethodDispatcher()}}
                        )
    #
    cherrypy.tree.mount(EthearnalJobView(EthearnalJobPostController(e_profile)),
                        '/api/v1/job', {'/': {
                            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                            'tools.sessions.on': True,
                            'tools.response_headers.on': True,
                            'tools.response_headers.headers': [('Content-Type', 'text/plain')],
                            }
                         }
                        )

    cherrypy.tree.mount(EthearnalUploadFileView(e_profile),
                        '/api/v1/upload', {'/': {
                            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                            'tools.sessions.on': True,
                            'tools.response_headers.on': True,
                            'tools.response_headers.headers': [('Content-Type', 'text/plain')],
                            }
                         }
                        )

    #
    cherrypy.engine.start()

    print('STATIC FILES DIR:', e_profile.files_dir)
    print('WEBUI DIR:', http_webdir)
    print('PROFILE DIR:', e_profile.data_dir)
    cherrypy.engine.block()


if __name__ == '__main__':
    args = parser.parse_args()
    socket_host, socket_port = args.http_host_port.split(':')
    profile_dir = args.data_dir
    http_webdir = args.http_webdir
    socket_port = int(socket_port)

    if os.path.isdir(args.data_dir):
        print('Using existing profile directory: %s' % profile_dir)
    else:
        mkdir(profile_dir)

    try:
        main(http_webdir=http_webdir,
             socket_host=socket_host,
             socket_port=socket_port,
             profile_dir=profile_dir)
    except Exception as e:
        traceback.print_exc(file=sys.stdout)


