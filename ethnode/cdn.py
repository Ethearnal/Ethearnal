import cherrypy
import os
from dhtcdn.webapi import WebCDN, WebCDNSite

site_conf = {
    '/': {
        'tools.sessions.on': True,
        'tools.staticdir.root': os.path.abspath(os.getcwd())
    },
    '/api/ui': {
        'tools.staticdir.root': os.path.abspath(os.getcwd()),
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'cdnapidef/swagger',
        'tools.staticdir.index': 'index.html',
    }

}

cherrypy.tree.mount(WebCDNSite(), '/', site_conf)
cdn = WebCDN(cherry=cherrypy)
cherrypy.engine.start()
cherrypy.engine.block()
