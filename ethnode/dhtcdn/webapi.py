import os
import io
import cherrypy
import json
from toolkit.kadmini_codec import sha256_bin_digest, guid_bin_to_hex


class WebCDNSite(object):
    @cherrypy.expose
    def index(self):
        print('REQ LOCAL', cherrypy.request.local)
        return "ErtCDN ethearnal 0.0.1"
    # todo make entry point redirect to ui


class WebCDN(object):
    exposed = True

    def __init__(self, cherry=cherrypy,
                 mount_point: str='/api/cdn/v1/cdn/resource',
                 store_dir: str='cdn_profile/',
                 mount_it=True):
        self.cherry = cherry
        self.mount_point = mount_point
        self.store_dir = os.path.abspath(store_dir)

        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

    def GET(self, hkey):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        ct = None
        try:
            f_name_meta = '%s.%s' % (hkey, 'json')
            upload_file_meta = os.path.join(self.store_dir, f_name_meta)
        except:
            self.cherry.response.status = 408
            return b'{"error":"can\'t construct meta_file"}'
        fext = None
        try:
            with open(upload_file_meta, 'rb') as u_f_m:
                data = u_f_m.read()

                data_d = json.loads(data.decode())
                fext = data_d['fext'].strip()
                hk_meta = data_d['hkey'].strip()
                ct = data_d["Content-Type"].strip()
                cherrypy.response.headers["Content-Type"] = ct
                if hkey != hk_meta or not fext or not ct:
                    self.cherry.response.status = 408
                    return b'{"error":"integrity error with metadata"}'
        except Exception as e:
            self.cherry.response.status = 408
            msg = '{"error":"general error with metadata %s"}' % str(e)
            return msg.encode()
        # if 'range' in cherrypy.request.headers:
        #     print(cherrypy.request.headers['range'], 'CT RANGE')
        bts = b''
        if not fext:
            self.cherry.response.status = 408
            return b'{"error":"unknown file extension"}'

        try:
            f_name = '%s.%s' % (hkey, fext)
            #  upload_path = os.path.join(self.store_dir)
            upload_file = os.path.join(self.store_dir, f_name)
        except Exception as e:
            msg = '{"error":"general error with upload file name %s"}' % str(e)
            return msg.encode()

        if not os.path.isfile(upload_file):
            self.cherry.response.status = 409
            msg = '{"error":"% s not found" % s}' % upload_file
            return msg.encode()

        size = 0
        uf = io.BytesIO()
        try:
            with open(upload_file, 'rb') as u_f:
                while True:
                    data = u_f.read(8192)
                    if not data:
                        break
                    uf.write(data)
                    size += len(data)
            u_f.close()
            uf.seek(0)
            bts = uf.read()
            self.cherry.response.status = 200
            return bts
        except Exception as e:
            self.cherry.response.status = 409
            err = '{"error":"%s"}' % str(e)
            return err.encode()

    def POST(self, ufile):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        ct = None
        try:
            ct = str(ufile.content_type)
            fext = ct.split('/')[1]
            if not ct:
                self.cherry.response.status = 408
                return b'{"error":"can\'t determine content-type"}'
        except:
            self.cherry.response.status = 408
            return b'{"error":"can\'t determine content-type"}'
        size = 0
        uf = io.BytesIO()
        while True:
            data = ufile.file.read(8192)
            if not data:
                break
            uf.write(data)
            size += len(data)

        uf.seek(0)
        uf_bts = uf.read()
        hk = guid_bin_to_hex(sha256_bin_digest(uf_bts))
        st_hk = hk.decode()
        f_name = '%s.%s' % (st_hk, fext)
        f_name_meta = '%s.json' % st_hk
        upload_file = os.path.join(self.store_dir, f_name)
        upload_meta_file = os.path.join(self.store_dir, f_name_meta)

        with open(upload_file, 'wb') as u_f:
            uf.seek(0)
            u_f.write(uf.read())
        u_f.close()

        with open(upload_meta_file, 'wb') as u_m_f:
            u_m_f.write(json.dumps({'fext': fext, 'hkey': st_hk, "Content-Type": ct}, ensure_ascii=False).encode())
        u_m_f.close()

        self.cherry.response.status = 201
        return hk.decode()

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                },
                '/api/ui': {
                    'tools.staticdir.on': True,
                    'tools.staticdir.dir': 'cdnapidef/swagger',
                    'tools.staticdir.index': 'index.html',
                    'tools.staticdir.root': os.path.abspath(os.getcwd())
                }

            }
        )

