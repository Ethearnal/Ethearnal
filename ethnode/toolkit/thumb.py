import io
from PIL import Image


class ImgThumbnail(object):

    def get_file_name(self, fn):
        spl = fn.split('.')
        thumb_name = spl[0] + '.th.' + spl[1]
        print(fn)
        print(thumb_name)
        return thumb_name

    def resize(self, fn, max_w, max_h):
        with open(fn, 'rb') as fp:
            img = Image.open(fp)
            img.thumbnail((max_w, max_h), Image.ANTIALIAS)
            img.save(self.get_file_name(fn))

# test_file = 'data_demo/cdn1_d/feb3a3312025eee33ee33c765fcd91187b1b8d73eaa7496c96948775e6f3e0cb.jpeg'
# rsz = Thumbnail()
# rsz.thumb_to_file(test_file, 400, 400)
