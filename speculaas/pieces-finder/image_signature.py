import hashlib
import io

import binascii


def signature(image):
    m = hashlib.md5()
    bytes_io = io.BytesIO()
    image.save(bytes_io, format='png', transparent=1)
    value = bytes_io.getvalue()
    m.update(value)
    digest = m.digest()
    return binascii.hexlify(digest).decode('utf8')
