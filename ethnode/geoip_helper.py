from time import gmtime, strftime
import requests
import sys

filename = strftime("%Y%m%d%H%M%S", gmtime()) + '.txt'


class GeoIpHelper:

    def __init__(self, user_ip, user_id):
        self.user_ip = user_ip
        self.user_id = user_id

    def get_geoip_data(self):
        """
        Get geoip data by ip address
        :return dict:
        """
        r = requests.get('http://freegeoip.net/json/{}'.format(self.user_ip))
        return r.json()

    def write_in_file(self, geoip):
        """
        Write data in file in `/geoip_data`
        :param geoip:
        :return dict:
        """
        if geoip:
            try:
                geoip['user_id'] = self.user_id
                with open('geoip_data/' + filename, 'w') as f:
                    f.write(str(geoip))
                return geoip
            except Exception as e:
                print(str(e))
                return False

    def get_info(self):
        """
        General function
        :return:
        """
        geoip = dict(self.get_geoip_data())
        write_in_file_result = self.write_in_file(geoip)
        return write_in_file_result


if __name__ == "__main__":
    user_ip = sys.argv[1]
    user_id = sys.argv[2]

    print((GeoIpHelper(user_ip, user_id)).get_info())
