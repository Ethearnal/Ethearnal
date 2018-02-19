import os
import requests








#
#
# class WebDHTGetGeoIpData(object):
#     exposed = True
#
#     def __init__(self,
#                  cherry,
#                  mount_point: str,
#                  mount_it=True):
#         self.cherry = cherry
#         self.mount_point = mount_point
#         if mount_it:
#             self.mount()
#             print('MOUNT GUIDS ENDPOINT')
#
#     def get_geoip_data(self, user_ip):
#         """
#         Get geoip data by ip address
#         :return dict:
#         """
#         r = requests.get('http://freegeoip.net/json/{}'.format(user_ip))
#         return r.json()
#
#     def write_in_file(self, geoip, filename):
#         """
#         Write data in file in `/geoip_data`
#         :param filename:
#         :param geoip:
#         :return dict:
#         """
#         file_exist = os.path.exists('geoip_data/' + filename)
#         if file_exist:
#             with open('geoip_data/' + filename, 'r') as content_file:
#                 file_data = content_file.read()
#                 return file_data
#         else:
#             if geoip:
#                 try:
#                     with open('geoip_data/' + filename, 'w') as f:
#                         f.write(str(geoip))
#                     return geoip
#                 except Exception as e:
#                     print(str(e))
#                     return False
#
#     def GET(self, ip):
#         # todo
#         filename = ip.replace(".", "-") + '.json'
#         geoip = dict(self.get_geoip_data(ip))
#         write_in_file_result = self.write_in_file(geoip, filename)
#         return str(write_in_file_result)
#
#     def mount(self):
#         self.cherry.tree.mount(
#             self,
#             self.mount_point, {'/': {
#                 'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
#                 'tools.sessions.on': True,
#             }
#             }
#         )