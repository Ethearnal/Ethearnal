import os
import cherrypy
import config
from toolkit import tools
import argparse
from io import BytesIO

parser = argparse.ArgumentParser(description='Ethearnal p2p ert web service node')

parser.add_argument('-l', '--http_host_port',
                    default=config.web_svc_host_port,
                    help='E,g 0.0.0.0:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.web_svc_data_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)

parser.add_argument('-u', '--uploads_dir',
                    default=config.web_svc_upload_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)


class ErtWebServiceProfile(object):
    def __init__(self,
                 data_dir=config.web_svc_data_dir,
                 upload_dir=config.web_svc_upload_dir,
                 ):

        self.data_dir = tools.mkd(data_dir)
        self.upload_dir = tools.mkd(upload_dir)


class EthearnalFileUploadView(object):
    exposed = True

    def __init__(self, web_svc_profile: ErtWebServiceProfile):
        self.profile = web_svc_profile

    def POST(self, bfile,
             # bguid_owner,
             # bfile_bsig
             ):
        upload_path = os.path.normpath(self.profile.upload_dir)
        upload_file = os.path.join(upload_path, bfile.filename)
        size = 0
        with open(upload_file, 'wb') as out:
            while True:
                data = bfile.file.read(8192)
                if not data:
                    break
                out.write(data)
                # print(data)
                size += len(data)
        cherrypy.response.status = 201
        return b''

    def GET(self, file_name):
        upload_path = os.path.normpath(self.profile.upload_dir)
        upload_file = os.path.join(upload_path, file_name)
        size = 0
        cherrypy.response.headers['Content-Disposition'] = 'attachment; filename="%s"' % file_name
        io_out = BytesIO()
        with open(upload_file, 'rb') as io_in:
            while True:
                data = io_in.read(8192)
                if not data:
                    break
                size += len(data)
                io_out.write(data)
                # print(data)
        io_out.seek(0)
        return io_out.read()


def main():
    args = parser.parse_args()
    socket_host, socket_port = args.http_host_port.split(':')
    data_dir = args.data_dir
    socket_port = int(socket_port)

    svc = ErtWebServiceProfile(data_dir=data_dir)
    print('WEB SVC DATA DIR:', svc.data_dir)
    print('WEB SVC UPLOAD DIR:', svc.upload_dir)
    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port

    cherrypy.tree.mount(EthearnalFileUploadView(svc),
                        '/api/v1/file', {'/': {
                            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                            'tools.sessions.on': True,
                            'tools.response_headers.on': True,
                            'tools.response_headers.headers': [('Content-Type', 'application/octet-stream')],
                            }
                         }
                        )
    cherrypy.engine.start()
    cherrypy.engine.block()


if __name__ == '__main__':
    main()

