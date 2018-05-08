const stream = require('stream');
const util = require('util');

const Transform = stream.Transform || require('readable-stream').Transform;

export function Upper(options) {
  // allow use without new
  if (!(this instanceof Upper)) {
    return Upper(options);
  }

  // init Transform
  Transform.call(this, options);
}
util.inherits(Upper, Transform);

Upper.prototype._transform = function(chunk, enc, cb) {
  const upperChunk = chunk.toString().toUpperCase();
  this.push(upperChunk);
  cb();
};
