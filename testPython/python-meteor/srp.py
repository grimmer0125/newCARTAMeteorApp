# This file uses code and architecture from the 'srp' package, described and licensed below:
# Author: Tom Cocagne
# Home Page: https://github.com/cocagne/pysrp
# Download URL: http://pypi.python.org/pypi/srp
# License:

# The MIT License (MIT)

# Copyright (c) 2012 Tom Cocagne

# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# Definitions (copied from original SRP source):
#
# N    A large safe prime (N = 2q+1, where q is prime)
#      All arithmetic is done modulo N.
# g    A generator modulo N
# k    Multiplier parameter (k = H(N, g) in SRP-6a, k = 3 for legacy SRP-6)
# s    User's salt
# I    Username
# p    Cleartext Password
# H()  One-way hash function
# ^    (Modular) Exponentiation
# u    Random scrambling parameter
# a,b  Secret ephemeral values
# A,B  Public ephemeral values
# x    Private key (derived from p and s)
# v    Password verifier

from __future__ import print_function

import hashlib
import os
import binascii
import math

SHA1   = 0
SHA224 = 1
SHA256 = 2
SHA384 = 3
SHA512 = 4

NG_1024   = 0
NG_2048   = 1
NG_4096   = 2
NG_8192   = 3
NG_CUSTOM = 4

_hash_map = { SHA1   : hashlib.sha1,
              SHA224 : hashlib.sha224,
              SHA256 : hashlib.sha256,
              SHA384 : hashlib.sha384,
              SHA512 : hashlib.sha512 }


_ng_const = (
# 1024-bit
('''\
EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496\
EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8E\
F4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA\
9AFD5138FE8376435B9FC61D2FC0EB06E3''',
"2"),
# 2048
('''\
AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4\
A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF60\
95179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF\
747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B907\
8717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB37861\
60279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DB\
FBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73''',
"2"),
# 4096
('''\
FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08\
8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B\
302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9\
A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6\
49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8\
FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D\
670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C\
180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718\
3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D\
04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D\
B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226\
1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C\
BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC\
E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26\
99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB\
04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2\
233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127\
D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199\
FFFFFFFFFFFFFFFF''',
"5"),
# 8192
('''\
FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08\
8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B\
302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9\
A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6\
49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8\
FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D\
670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C\
180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718\
3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D\
04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D\
B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226\
1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C\
BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC\
E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26\
99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB\
04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2\
233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127\
D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934028492\
36C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406\
AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918\
DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B33205151\
2BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03\
F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97F\
BEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AA\
CC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58B\
B7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632\
387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E\
6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA\
3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C\
5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD9\
22222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC886\
2F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A6\
6D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC5\
0846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268\
359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6\
FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E71\
60C980DD98EDD3DFFFFFFFFFFFFFFFFF''',
'0x13')
)

def get_ng( ng_type, n_hex, g_hex ):
    if ng_type < NG_CUSTOM:
        n_hex, g_hex = _ng_const[ ng_type ]
    return int(n_hex,16), int(g_hex,16)


def int_to_hex_bytes(n):
    return int_to_hex_string(n).encode('ascii')

def bytes_to_int(s):
    """
    Convert a `bytes` object into an `int` object.
    """
    n = s[0]
    for b in (x for x in s[1:]):
        n = (n << 8) | b
    return n

def int_to_hex_string(n):
    """
    Like the built-in hex() function, but without the leading '0x'
    """
    return hex(n)[2:]

def bytes_to_hex_string(s):
    """
    Convert a `bytes` object to a python string containing hex digits with no leading '0x'
    """
    return int_to_hex_string(bytes_to_int(s))

def get_random( nbytes ):
    return bytes_to_int( os.urandom( nbytes ) )

class SRPError(RuntimeError):
    pass

class User (object):
    def __init__(self, username, password, hash_alg=SHA1, ng_type=NG_2048, n_hex=None, g_hex=None, debugPrint=False):
        if ng_type == NG_CUSTOM and (n_hex is None or g_hex is None):
            raise ValueError("Both n_hex and g_hex are required when ng_type = NG_CUSTOM")
        N,g        = get_ng( ng_type, n_hex, g_hex )
        hash_class = _hash_map[ hash_alg ]

        # Convenience functions for getting the right types out of hashes.
        # Sometimes we want to get an int out of it for doing math.
        self.hash_int = lambda arg: bytes_to_int(hash_class(arg).digest())
        # Other times we want bytes to be fed into another hash function.
        self.hash_bytes = lambda arg: hash_class(arg).hexdigest().encode('ascii')

        # This parameter is calculated independently on server and client, and
        # shouldn't change from one run of the protocol to the next.
        k          = self.hash_int(int_to_hex_bytes(N) + int_to_hex_bytes(g)) # H( hash_class, N, g )

        self.I     = username
        self.p     = password
        self.a     = get_random( 36 )
        self.A     = pow(g, self.a, N)
        self.Astr  = int_to_hex_bytes(self.A)
        self.v     = None
        self.M     = None
        self.K     = None
        self.H_AMK = None
        self._authenticated = False

        self.hash_class = hash_class
        self.N          = N
        self.g          = g
        self.k          = k

        self.debugPrint = debugPrint

    def _dbPrint(self, *args):
        if not self.debugPrint:
            return

        print(*args)

    def authenticated(self):
        return self._authenticated

    def get_username(self):
        return self.I

    def get_session_key(self):
        return self.K if self._authenticated else None

    def start_exchange(self):
        """
        Based on Meteor's SRP.Client.prototype.startExchange().
        Returns a python string to be sent to the server to kick off the authentication.
        """
        return self.Astr.decode('ascii')

    def respond_to_challenge(self, challenge):
        """
        Based on Meteor's SRP.Client.prototype.respondToChallenge().
        Returns a string called M.
        """

        ###########################################
        # First, clean up and verify the arguments.
        ###########################################

        # All these keys must be present in `challenge`
        try:
            salt = challenge['salt'] # This is a uuid string used as a salt.
            B = challenge['B'] # This is a string of hex values, with no leading '0x'.
            identity = challenge['identity'] # This is the user's mongo _id string.
        except KeyError as e:
            raise SRPError('Invalid challenge from server. Missing `'+e.args[0]+'` field.')

        # Note: Meteor uses the user's _id as the SRP username (also called identity).
        # It does NOT use the user's `username` field.
        self.I = identity
        self.B = int(B, 16)
        self.Bstr = B.encode('ascii')
        self.s = salt.encode('ascii')

        self._dbPrint('I:', self.I)
        self._dbPrint('B:', B)
        self._dbPrint('Bstr:', self.Bstr)
        self._dbPrint('s:', self.s)

        N = self.N
        g = self.g
        k = self.k

        if (self.B % N) == 0:
            raise SRPError('B mod N is zero.')

        ###############################################################################
        # Calculate a bunch of intermediate variables to be used to generate M and HAMK
        ###############################################################################

        self.u = self.hash_int(self.Astr + self.Bstr)

        if self.u == 0:
            raise SRPError('u is zero.')

        self.x = self.hash_int(self.s + self.hash_bytes((self.I + ':' + self.p).encode('ascii')))
        self._dbPrint('x:', int_to_hex_string(self.x))

        self.aux = self.a + self.u*self.x
        self._dbPrint('aux:', int_to_hex_string(self.aux))

        self.kgx = self.k * pow(g, self.x, N)
        self._dbPrint('kgx:', int_to_hex_string(self.kgx))

        self.S = pow((self.B - self.kgx), self.aux, N)
        self.Sstr = int_to_hex_bytes(self.S)
        self._dbPrint('Sstr:', self.Sstr)

        #########################################################
        # Now that we have everything set up, generate M and HAMK
        #########################################################

        # Mstr and H_AMKstr are strings of bytes
        self.Mstr = self.hash_bytes(self.Astr + self.Bstr + self.Sstr)
        self._dbPrint('M:', self.Mstr)

        # Calculate the HAMK now and store it so we can use it later
        # to compare it against what the server says it is.
        self.H_AMKstr = self.hash_bytes(self.Astr + self.Mstr + self.Sstr)
        self._dbPrint('H_AMK:', self.H_AMKstr)

        # return a real python string
        return self.Mstr.decode('ascii')

    def verify_confirmation(self, verification):
        """
        Based on Meteor's SRP.Client.prototype.verifyConfirmation().
        Returns True or throws an error if the server's verification is invalid.
        Also sets the SRP user's _authenticated flag accordingly.
        """
        try:
            host_HAMK = verification['HAMK']
        except KeyError:
            raise SRPError('Invalid verification message from server: missing `HAMK` field.')

        self._dbPrint('H_AMKstr:', self.H_AMKstr)
        self._dbPrint('host_HAMK:', host_HAMK)

        self._authenticated = self.H_AMKstr == host_HAMK.encode('ascii')

        if not self._authenticated:
            raise SRPError('Invalid verification from server: '+host_HAMK)

        return True

def MeteorUser(password, debugPrint=False):
    """
    A convenience function to set all the parameters necessary for authenticating
    with a Meteor server.
    """
    return User(None, password, hash_alg=SHA256, ng_type=NG_1024, debugPrint=debugPrint)
