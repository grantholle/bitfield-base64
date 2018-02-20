'use strict'

module.exports = class BitField {
  constructor (bits) {
    if (Array.isArray(bits)) {
      this.fromArray(bits)
    } else if (typeof bits === 'string') {
      this.fromBase64(bits)
    } else if (bits instanceof BitField) {
      if (window.Uint8Array) {
        this.values = new Uint8Array(bits.values)
      } else {
        this.values = new Array(bits.values.length)
        for (let i = 0; i < bits.values.length; ++i) {
          this.values[i] = bits.values[i]
        }
      }
    } else if (typeof bits === 'number') {
      const cells = Math.ceil(bits / 8)

      if (window.Uint8Array) {
        this.values = new Uint8Array(cells)
      } else {
        this.values = new Array(cells)
        for (var i = 0; i < cells; ++i) {
          this.values[i] = 0
        }
      }
    } else {
      throw new TypeError('Illegal argument: ' + bits)
    }
  }

  get (index) {
    const i = (index / 8) | 0
    const bit = index % 8
    return (this.values[i] & (1 << bit)) !== 0
  }

  set (index, value) {
    const i = (index / 8) | 0
    const bit = index % 8

    if (value) {
      this.values[i] |= 1 << bit
    } else {
      this.values[i] &= ~(1 << bit)
    }
  }

  // base64 code is from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  toBase64 () {
    const aBytes = this.values
    let nMod3 = 2
    let sB64Enc = ''
    const uint6ToB64 = nUint6 => {
      return (
        nUint6 < 26 ? nUint6 + 65
          : nUint6 < 52 ? nUint6 + 71
            : nUint6 < 62 ? nUint6 - 4
              : nUint6 === 62 ? 43
                : nUint6 === 63 ? 47
                  : 65)
    }

    for (let nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
      nMod3 = nIdx % 3
      nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24)

      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(
          uint6ToB64(nUint24 >>> 18 & 63),
          uint6ToB64(nUint24 >>> 12 & 63),
          uint6ToB64(nUint24 >>> 6 & 63),
          uint6ToB64(nUint24 & 63))
        nUint24 = 0
      }
    }

    return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) +
      (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==')
  }

  toArray () {
    const json = new Array(this.values.length * 8)

    for (let i = 0; i < json.length; ++i) {
      json[i] = this.get(i) ? 1 : 0
    }

    return json
  }

  fromBase64 (sBase64) {
    const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '')
    const nInLen = sB64Enc.length
    const nOutLen = nInLen * 3 + 1 >> 2
    const bitField = new BitField(nOutLen * 8)
    const taBytes = bitField.values
    const b64ToUint6 = nChr => {
      return (
        nChr > 64 && nChr < 91 ? nChr - 65
          : nChr > 96 && nChr < 123 ? nChr - 71
            : nChr > 47 && nChr < 58 ? nChr + 4
              : nChr === 43 ? 62
                : nChr === 47 ? 63
                  : 0)
    }

    for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
        }
        nUint24 = 0
      }
    }

    return bitField
  }

  fromArray (json) {
    const bitfield = new BitField(json.length)

    for (let i = 0; i < json.length; ++i) {
      if (json[i]) {
        bitfield.set(i, true)
      }
    }

    return bitfield
  }
}
