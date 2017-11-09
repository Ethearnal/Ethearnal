import rsa
import binascii


def test_rsa_generic():
    print('Testing key pair generation')
    pubkey, privkey = rsa.newkeys(1024)
    print('Testing encryption')
    message = 'hola there'.encode('utf8')
    crypto = rsa.encrypt(message, pubkey)
    decrypto = rsa.decrypt(crypto, privkey)
    assert decrypto == message
    print('Testing signing')
    signature = rsa.sign(message, privkey, 'SHA-256')
    print('SHA-256 signature hex:')
    print(len(signature))
    sig = binascii.hexlify(signature)
    print(sig)
    print('Verify')
    rsa.verify(message, signature, pubkey)
    print('RSA asymmetric key functions ok')
    test_rsa_generic.pubkey = pubkey
    test_rsa_generic.signature = signature


if __name__ == '__main__':
    test_rsa_generic()


