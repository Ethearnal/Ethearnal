import sys
from helpers.wordnet_parser import WordnetParser, GigGeneratorWordnet, ImagesFromCdnData
verbs_src = 'data_demo/txt_wordnet/data.verb'
cdn_data_dir = 'data_demo/cdn1_d'

wdn = WordnetParser(verbs_src)

img = ImagesFromCdnData(cdn_data_dir)

gen = GigGeneratorWordnet(wdn, img)

