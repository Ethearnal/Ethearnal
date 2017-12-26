import os
import bson
import io
import cherrypy
import json
import requests
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
                 dhf=None,
                 mount_point: str='/api/cdn/v1/resource',
                 store_dir: str='cdn_profile/',
                 mount_it=True):
        self.cherry = cherry
        self.mount_point = mount_point
        self.store_dir = os.path.abspath(store_dir)
        self.dhf = dhf
        self.dhf.cdn = self

        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

    def get_local_meta_data(self, hkey):
        f_name_meta = '%s.%s' % (hkey, 'json')
        upload_file_meta = os.path.join(self.store_dir, f_name_meta)
        data_d = None
        if not os.path.isfile(upload_file_meta):
            self.cherry.response.status = 410
            return data_d
        with open(upload_file_meta, 'rb') as u_f_m:
            data = u_f_m.read()
            data_d = json.loads(data.decode())
        u_f_m.close()
        return data_d

    def get_local_data(self, hkey, fext):
        try:
            f_name = '%s.%s' % (hkey, fext)
            #  upload_path = os.path.join(self.store_dir)
            upload_file = os.path.join(self.store_dir, f_name)
        except Exception as e:
            msg = '{"error":"general error with getting file name %s"}' % str(e)
            self.cherry.response.status = 410
            print(msg)
            return None

        if not os.path.isfile(upload_file):
            self.cherry.response.status = 411
            msg = '{"error":"% s not found" }' % upload_file
            print(msg)
            return None

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
            return bts
        except:
            return None

    def get_remote_meta_data(self, cdn_url, hkey):
        url = '%s?hkey=%s&meta=1' % (cdn_url, hkey)
        return self.get_file_from_url(url)

    def get_remote_data(self, cdn_url, hkey):
        print('GET REMOTE DATA')
        url = '%s?hkey=%s' % (cdn_url, hkey)
        print('GET URL', url)
        return self.get_file_from_url(url)

    def set_local_meta_data(self, hkey, data):
        f_name_meta = '%s.%s' % (hkey, 'json')
        upload_file_meta = os.path.join(self.store_dir, f_name_meta)
        data_js = json.dumps(data, ensure_ascii=False)
        data_bt = data_js.encode()
        with open(upload_file_meta, 'wb') as u_f_m:
            u_f_m.write(data_bt)
        u_f_m.close()

    def set_local_data(self, hkey, fext, bts):
        f_name = '%s.%s' % (hkey, fext)

        upload_file = os.path.join(self.store_dir, f_name)
        with open(upload_file, 'wb') as oufp:
            oufp.write(bts)
        oufp.close()

    @staticmethod
    def get_file_from_url(url):

        r = requests.get(url, stream=True)
        # fpio = io.BytesIO()
        print('GET FROM URLK', r, r.status_code)
        if r.status_code == 200:
            r.raw.decode_content = True
            bts = r.raw.read()
            print('BTS', len(bts))
            return bts

    def dhf_pull(self, hk_hex):
        t1 = self.dhf.pull_local('', hk_hex=hk_hex)
        t2 = self.dhf.pull_remote('', hk_hex=hk_hex)
        if t2:
            t = t2
        else:
            t = t1
        if not t:
            return None
        d = bson.loads(t[-1])
        return d

    @property
    def cdn_url(self):
        return '%s%s' % (self.dhf.ert.cdn_service_http_url, self.mount_point)

    def on_post(self, hk_hex):
        self.dhf.push('', {'cdn_url': self.cdn_url,
                           'hk_hex': hk_hex,
                           }, hk_hex=hk_hex, remote_only=True)

    def try_get_meta(self, hkey):
        print('TRY GET META:', hkey)
        try:
            t = self.dhf.pull_remote(key='', hk_hex=hkey)
            v = bson.loads(t[-1])
            if 'e' in v:
                l = v['e']
                d = l[1]
                if 'cdn_url' in d:
                    bts = self.get_remote_meta_data(cdn_url=d['cdn_url'], hkey=hkey)
                    meta_dict = json.loads(bts.decode())
                    self.set_local_meta_data(hkey, data=meta_dict)
                    print('METADATA SAVED')
                    # return meta_dict
                    return d['cdn_url']

            # print('ON GET ', d)
        except Exception as e:
            print('e e e ', str(e))
        # print("T", t, len(t))

    def GET(self, hkey, meta=None):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        ct = None

        try:
            f_name_meta = '%s.%s' % (hkey, 'json')
            upload_file_meta = os.path.join(self.store_dir, f_name_meta)
        except:
            self.cherry.response.status = 400
            return b'{"error":"can\'t construct meta_file"}'
        fext = None
        cdn_url_dht = None
        try:
            if not os.path.isfile(upload_file_meta):
                print('META-FILE NOT FOUND')
                self.cherry.response.status = 400
                # return b'{"error":"integrity error with metadata not found"}'
                cdn_url_dht = self.try_get_meta(hkey=hkey)

            with open(upload_file_meta, 'rb') as u_f_m:
                data = u_f_m.read()
                if meta:
                    return data
                    # only metadata requested

                data_d = json.loads(data.decode())
                fext = data_d['fext'].strip()
                hk_meta = data_d['hkey'].strip()
                ct = data_d["Content-Type"].strip()
                cherrypy.response.headers["Content-Type"] = ct
                if hkey != hk_meta or not fext or not ct:
                    return b'{"error":"integrity error with hkey diff metadata"}'
        except Exception as e:
            msg = '{"error":"exc %s}' % str(e)
            self.cherry.response.status = 400
            return msg.encode()

        # bts = b''
        if not fext:
            self.cherry.response.status = 400
            return b'{"error":"unknown file extension"}'

        try:
            f_name = '%s.%s' % (hkey, fext)
            #  upload_path = os.path.join(self.store_dir)
            upload_file = os.path.join(self.store_dir, f_name)
        except Exception as e:
            msg = '{"error":"general error with getting file name %s"}' % str(e)
            return msg.encode()

        if not cdn_url_dht:
            cdn_url_dht = self.try_get_meta(hkey=hkey)
        print('CDN_URL_DHT', cdn_url_dht)
        if not os.path.isfile(upload_file):
            if cdn_url_dht:
                try:
                    bts = self.get_remote_data(cdn_url=cdn_url_dht, hkey=hkey)
                    print('BTS,', len(bts))
                    self.set_local_data(hkey=hkey, fext=fext, bts=bts)
                except Exception as e:
                    self.cherry.response.status = 400
                    msg = '{"error":"on get remote set local data: %s"}' % str(e)
                    return msg.encode()
            else:
                self.cherry.response.status = 400
                msg = '{"error":"% s not found"}' % upload_file
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
            self.cherry.response.status = 400
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
        self.on_post(st_hk)
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

