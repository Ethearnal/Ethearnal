import os
from io import BytesIO
from toolkit.kadmini_codec import sha256_bin_digest, guid_bin_to_hex


def read_in_chunks(fname, chunk_sz=4096, max_chuncks=100) -> BytesIO:
    outio = BytesIO()
    cnt = 0
    with open(fname, "rb") as in_file:
        while True:

            chunk = in_file.read(chunk_sz)
            cnt += 1
            if cnt >= max_chuncks:
                raise IOError('max size exceed bytes: %d' % (max_chuncks * chunk_sz))

            if chunk == "":
                break  # end of file
            outio.write(chunk)
    outio.seek(0)
    return outio


def bytes_to_hkey_and_io(bts: bytes) -> (str, BytesIO):
    bio = BytesIO(bts)
    bio.seek(0)
    hk = guid_bin_to_hex(sha256_bin_digest(bts))
    return hk, bio


def write_to_file_inmem(fn, inpio: BytesIO):
    with open(fn, 'wb') as outfp:
        inpio.seek(0)
        outfp.write(inpio.read())


def read_from_file_inmem(fn: str) -> BytesIO:
    bio = BytesIO()
    with open(fn, 'rb') as inpfp:
        inpfp.seek(0)
        bio.write(inpfp.read())
        bio.seek(0)
    return bio


class FileSystemHashStore(object):

    def __init__(self, data_directory):
        self.data_dir = os.path.abspath(data_directory)
        if not os.path.isdir(self.data_dir):
            raise IOError('Not directory %s' % self.data_dir)

    def file_name(self, hk: str):
        return '%s/%s' % (self.data_dir, hk)

    def has_hkey(self, hk: str):
        fn = self.file_name(hk)
        return os.path.isfile(fn)

    def get_hk_and_bio(self, bts: bytes):
        hk, bio = bytes_to_hkey_and_io(bts)
        return hk, bio

    def save_io(self, hk: str, bio):
        write_to_file_inmem(self.file_name(hk), bio)

    def read_io(self, hk: str):
        if self.has_hkey(hk):
            fn = self.file_name(hk)
            bio = read_from_file_inmem(fn)
            return bio

    def save_bts_hk(self, bts):
        hk, bio = self.get_hk_and_bio(bts)
        self.save_io(hk, bio)

    def save_bts_str_key(self, key_st, bts):
        fn = self.file_name(key_st)
        with open(fn, 'wb') as out:
            out.write(bts)







