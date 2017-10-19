import os


def kwargs(**kwa):
    return kwa


def _mkdir(newdir):
    if os.path.isdir(newdir):
        pass
    elif os.path.isfile(newdir):
        raise OSError("The same name file as the desired "
                      "directory, '%s', already exists." % newdir)
    else:
        head, tail = os.path.split(newdir)
        if head and not os.path.isdir(head):
            _mkdir(head)

        if tail:
            os.mkdir(newdir)


def mkdir(newdir):
    _mkdir(newdir)
