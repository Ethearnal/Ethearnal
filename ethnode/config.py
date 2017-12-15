# web service data dir

data_dir = 'ethearnal_profile'
static_files = 'files'
# data_dir_static_files = '%s/files' % data_dir

# local public html UI

http_webdir = 'webui'
http_socket_host = '127.0.0.1'
http_socket_port = 4567
http_host_port = '%s:%d' % (http_socket_host, http_socket_port)
interactive = False

# upnp defaults

udp_host = '0.0.0.0'
udp_port = 56789
udp_host_port = '%s:%d' % (udp_host, udp_port)

# ertcdn service
ertcdn_data_dir = 'ertcdn_profile'
ertcdn_socket_host = '0.0.0.0'
ertcdn_socket_port = 5678
ertcdn_host_port = '%s:%d' % (ertcdn_socket_host, ertcdn_socket_port)

ertcdn_dev_bootstrap_host = '127.0.0.1'
ertcdn_dev_bootstrap_port = 5678
ertcdn_dev_bootstrap_host_port = '%s:%d' % (ertcdn_dev_bootstrap_host, ertcdn_dev_bootstrap_port)

# web service defaults
# web_svc_data_dir = 'websvc_profile'
# web_svc_upload_dir = 'websvc_uploads_profile'
# web_svc_socket_host = '0.0.0.0'
# web_svc_socket_port = 5678
# web_svc_host_port = '%s:%d' % (web_svc_socket_host, web_svc_socket_port)
