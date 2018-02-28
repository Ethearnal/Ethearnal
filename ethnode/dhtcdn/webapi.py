import os
import bson
import io
import cherrypy
import json
import requests
from toolkit.kadmini_codec import sha256_bin_digest, guid_bin_to_hex
from toolkit.thumb import ImgThumbnail


class WebCDNSite(object):
    @cherrypy.expose
    def index(self):
        print('REQ LOCAL', cherrypy.request.local)
        return "ErtCDN ethearnal 0.0.1"
    # todo make entry point redirect to ui


class WebCDNClientRequestHeaders(object):
    exposed = True

    def mount(self):
        cherrypy.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )

    def __init__(self,  mount_point: str='/api/cdn/v1/reqheaders', mount_it=True):

        self.mount_point = mount_point
        if mount_it:
            self.mount()

    def OPTIONS(self):
        cherrypy.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
        cherrypy.response.headers['Access-Control-Allow-Headers'] = 'content-type'
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        # tell CherryPy no avoid normal handler
        return b''

    def GET(self):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        headers = cherrypy.request.headers
        js = json.dumps(headers, ensure_ascii=False)
        bts = js.encode(encoding='utf-8')
        return bts


class WebCDN(object):
    exposed = True

    def __init__(self, cherry=cherrypy,
                 dhf=None,
                 mount_point: str='/api/cdn/v1/resource',
                 store_dir: str='cdn_profile/',
                 mount_it=True,
                 http_relay_urls=None,
                 http_relay_get_url=None):
        self.cherry = cherry
        self.mount_point = mount_point
        self.store_dir = os.path.abspath(store_dir)
        self.dhf = dhf
        self.dhf.cdn = self
        self.http_relay_get_url = http_relay_get_url
        self.thumbnail = ImgThumbnail()
        # from toolkit.tools import get_http_peers_from_http_tracker
        # url = 'http://159.65.56.140:8080/cluster.json'
        # relays = get_http_peers_from_http_tracker(url)
        # rurl = ['http://%s/api/cdn/v1/resource' % k for k in relays]
        # self.relays = set(rurl)
        self.relays = set()
        if http_relay_urls:
            for url in http_relay_urls:
                self.relays.add(url)
        if http_relay_get_url:
            self.relays.add(http_relay_get_url)

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
        # self.cherry.response.headers['Relay-Id-Source'] = '%s:%d' % (self.dhf.ert.cdn_host, self.dhf.ert.cdn_port)
        print('GET REMOTE DATA')
        url = '%s?hkey=%s' % (cdn_url, hkey)
        print('GET URL', url)
        return self.get_file_from_url(url)

    def set_local_meta_data(self, hkey, data):
        # self.cherry.response.headers['Relay-Id-Source'] = '%s:%d' % (self.dhf.ert.cdn_host, self.dhf.ert.cdn_port)
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

    # @staticmethod
    def get_file_from_url(self, url):
        try:
            relay_header_key = 'Relay-Id-Source'
            relay_header_val = '%s:%d' % (self.dhf.ert.cdn_host, self.dhf.ert.cdn_port)
            r = requests.get(url, headers={relay_header_key: relay_header_val}, stream=True)
            # fpio = io.BytesIO()
            print('GET FROM URLK', r, r.status_code)
            if r.status_code == 200:
                r.raw.decode_content = True
                bts = r.raw.read()
                print('BTS', len(bts))
                return bts
            else:
                return None
        except:
            return None

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
                           }, hk_hex=hk_hex, remote_only=False)

    def try_get_meta(self, hkey):

        print('TRY GET META:', hkey)
        try:
            t = self.dhf.pull_remote(key='', hk_hex=hkey)

            if not t:
                return
            v = bson.loads(t[-1])
            print('META V', v)
            if 'e' in v:
                l = v['e']
                d = l[1]
                if 'cdn_url' in d:
                    url = d['cdn_url']
                    if '127.0.0.1' in url:
                        print('LOOPBACK DETECTED IGNORE')
                        return None
                    bts = self.get_remote_meta_data(cdn_url=url, hkey=hkey)
                    meta_dict = json.loads(bts.decode())
                    self.set_local_meta_data(hkey, data=meta_dict)
                    print('METADATA SAVED')
                    # return meta_dict
                    return url

            # print('ON GET ', d)
        except Exception as e:
            print('e e e ', str(e))
        # print("T", t, len(t))

    def read_from_file_response(self, fn):
        size = 0
        uf = io.BytesIO()
        try:
            with open(fn, 'rb') as u_f:
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
            err = '{"error with thumb":"%s"}' % str(e)
            return err.encode()

    def GET(self, hkey=None, relay_id=None, thumb=None, meta=None):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        headers = self.cherry.request.headers
        if 'Relay-Id-Source' in headers:
            relay_val = headers['Relay-Id-Source']
            print('RELAY ID',relay_val)
            if relay_val == '%s:%d' % (self.dhf.ert.cdn_host, self.dhf.ert.cdn_port):
                return b'{"stop":"sel origin relay"}'


        def invalid_hkey():
            self.cherry.response.status = 401
            return b'{"error":"invalid hkey"}'
        if not hkey:
            return invalid_hkey()
        if len(hkey) != 64:
            return invalid_hkey()

        ct = None

        if relay_id:
            print('RELAY ID',relay_id)


        try:
            f_name_meta = '%s.%s' % (hkey, 'json')
            upload_file_meta = os.path.join(self.store_dir, f_name_meta)
        except:
            self.cherry.response.status = 400
            return b'{"error":"can\'t construct meta_file"}'
        fext = None
        cdn_url_dht = None
        meta_file_not_found = False
        try:
            if not os.path.isfile(upload_file_meta):
                print('META-FILE NOT FOUND')
                self.cherry.response.status = 400
                # if self.http_relay_get_url:
                for relay_url in list(self.relays):
                    if self.cherry.request.remote.ip in relay_url:
                        print("self origin relay IP")
                        continue
                    print('RELAY URL', relay_url)
                    bts = self.get_remote_meta_data(
                        relay_url,
                        hkey
                    )
                    if bts:
                        data = json.loads(bts.decode('utf-8'))
                        print('\n\n\n RELAY METADATA', data)
                        self.set_local_meta_data(hkey, data)
                        print('\n\n\n RELAY DATA SAVED', data)
                        break

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
        print('+ ++ +', upload_file)

        if not os.path.isfile(upload_file):
            #
            print('DATA FILE MISSING TRY RELAY')
            # if self.http_relay_get_url:
            for relay_url in self.relays:
                if self.cherry.request.remote.ip in relay_url:
                    print("self origin relay IP")
                print('RELAY URL', self.http_relay_get_url)
                bts = self.get_remote_data(
                    relay_url,
                    hkey
                )
                if bts:
                    self.set_local_data(hkey, fext, bts)
                    print('\n\n\n RELAY DATA SAVED')
                    break
            else:
                msg = '{"error":"% s not found"}' % upload_file
                return msg.encode()

        if thumb:
            thumb_name = self.thumbnail.get_file_name(upload_file)
            if 'svg' in thumb_name:
                return self.read_from_file_response(upload_file)
            if not os.path.isfile(thumb_name):
                self.thumbnail.resize(upload_file, 400, 400)
            return self.read_from_file_response(self.thumbnail.get_file_name(upload_file))
        else:
            return self.read_from_file_response(upload_file)

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
        # resize for thumbnails

        try:
            self.thumbnail.resize(fn=upload_file, max_w=400, max_h=400)
        except Exception as e:
            print('WARNING THUMBNAIL FAILED', e)  # todo

        with open(upload_meta_file, 'wb') as u_m_f:
            u_m_f.write(json.dumps({'fext': fext, 'hkey': st_hk, "Content-Type": ct}, ensure_ascii=False).encode())
        u_m_f.close()
        self.on_post(st_hk)
        self.cherry.response.status = 201
        return hk.decode()

    def OPTIONS(self):
        cherrypy.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
        cherrypy.response.headers['Access-Control-Allow-Headers'] = 'content-type'
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        # tell CherryPy no avoid normal handler
        return b''

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


