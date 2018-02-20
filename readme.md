# bitfield-base64

I barely understand anything about bits. I know a little js. I adapted this from a [gist](https://gist.github.com/panzi/56bbd884e00a5cc548dc) that was exactly what I needed, so I made it into a es6 class meant to be used in node.

```bash
npm i --save bitfield-base64
```

The constructor can take an array of of bits, a base64 string, or a number for the length of the bit field. I think? I just need this for base64 string.

```js
const bf = new BitField('somebase64string')
const array = bf.toArray()
bf.get(1)
bf.set(1, false)
```
