# web service data dir

data_dir = 'ethearnal_profile'
static_files = 'files'
# data_dir_static_files = '%s/files' % data_dir

# local public html

http_webdir = 'webdoc'
http_socket_host = '127.0.0.1'
http_socket_port = 4567
http_host_port = '%s:%d' % (http_socket_host, http_socket_port)
interactive = False

# upnp defaults

udp_host = '0.0.0.0'
udp_port = 34567
udp_host_port = '%s:%d' % (udp_host, udp_port)
