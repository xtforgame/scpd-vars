'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isWindows = process.platform === 'win32';
var util = require('util');

function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    if (!p || p === '.') {
      continue;
    }

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) {
      break;
    }
  }

  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) {
      break;
    }
  }

  if (start === 0 && end === lastIndex) {
    return arr;
  }
  if (start > end) {
    return [];
  }
  return arr.slice(start, end + 1);
}

var splitDeviceRe = /^([a-zA-Z]:|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)?([\\/])?([\s\S]*?)$/;

var splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\/]+?|)(\.[^./\\]*|))(?:[\\/]*)$/;

var win32 = {};

function win32SplitPath(filename) {
  var result = splitDeviceRe.exec(filename);
  var device = (result[1] || '') + (result[2] || '');
  var tail = result[3] || '';

  var result2 = splitTailRe.exec(tail);
  var dir = result2[1];
  var basename = result2[2];
  var ext = result2[3];
  return [device, dir, basename, ext];
}

function win32StatPath(path) {
  var result = splitDeviceRe.exec(path);
  var device = result[1] || '';
  var isUnc = !!device && device[1] !== ':';

  return {
    device: device,
    isUnc: isUnc,
    isAbsolute: isUnc || !!result[2],
    tail: result[3]
  };
}

function normalizeUNCRoot(device) {
  return '\\\\' + device.replace(/^[\\/]+/, '').replace(/[\\/]+/g, '\\');
}

win32.resolve = function () {
  var resolvedDevice = '';
  var resolvedTail = '';
  var resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1; i--) {
    var path = void 0;
    if (i >= 0) {
      path = arguments.length <= i ? undefined : arguments[i];
    } else if (!resolvedDevice) {
      path = process.cwd();
    } else {
      path = process.env['=' + resolvedDevice];

      if (!path || path.substr(0, 3).toLowerCase() !== resolvedDevice.toLowerCase() + '\\') {
        path = resolvedDevice + '\\';
      }
    }

    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    var result = win32StatPath(path);
    var device = result.device;
    var _isUnc = result.isUnc;
    var isAbsolute = result.isAbsolute;
    var tail = result.tail;

    if (device && resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }

    if (!resolvedDevice) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = tail + '\\' + resolvedTail;
      resolvedAbsolute = isAbsolute;
    }

    if (resolvedDevice && resolvedAbsolute) {
      break;
    }
  }

  if (isUnc) {
    resolvedDevice = normalizeUNCRoot(resolvedDevice);
  }

  resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');

  return resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail || '.';
};

win32.normalize = function (path) {
  var result = win32StatPath(path),
      device = result.device,
      isUnc = result.isUnc,
      isAbsolute = result.isAbsolute,
      tail = result.tail,
      trailingSlash = /[\\\/]$/.test(tail);

  tail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\');

  if (!tail && !isAbsolute) {
    tail = '.';
  }
  if (tail && trailingSlash) {
    tail += '\\';
  }

  if (isUnc) {
    device = normalizeUNCRoot(device);
  }

  return device + (isAbsolute ? '\\' : '') + tail;
};

win32.isAbsolute = function (path) {
  return win32StatPath(path).isAbsolute;
};

win32.join = function () {
  var paths = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!util.isString(arg)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (arg) {
      paths.push(arg);
    }
  }

  var joined = paths.join('\\');

  if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
    joined = joined.replace(/^[\\\/]{2,}/, '\\');
  }

  return win32.normalize(joined);
};

win32.relative = function (from, to) {
  from = win32.resolve(from);
  to = win32.resolve(to);

  var lowerFrom = from.toLowerCase();
  var lowerTo = to.toLowerCase();

  var toParts = trimArray(to.split('\\'));

  var lowerFromParts = trimArray(lowerFrom.split('\\'));
  var lowerToParts = trimArray(lowerTo.split('\\'));

  var length = Math.min(lowerFromParts.length, lowerToParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (lowerFromParts[i] !== lowerToParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  if (samePartsLength == 0) {
    return to;
  }

  var outputParts = [];
  for (var _i = samePartsLength; _i < lowerFromParts.length; _i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('\\');
};

win32._makeLong = function (path) {
  if (!util.isString(path)) {
    return path;
  }

  if (!path) {
    return '';
  }

  var resolvedPath = win32.resolve(path);

  if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
    return '\\\\?\\' + resolvedPath;
  } else if (/^\\\\[^?.]/.test(resolvedPath)) {
    return '\\\\?\\UNC\\' + resolvedPath.substring(2);
  }

  return path;
};

win32.dirname = function (path) {
  var result = win32SplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    return '.';
  }

  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};

win32.basename = function (path, ext) {
  var f = win32SplitPath(path)[2];

  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

win32.extname = function (path) {
  return win32SplitPath(path)[3];
};

win32.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError('Parameter \'pathObject\' must be an object, not ' + (typeof pathObject === 'undefined' ? 'undefined' : _typeof(pathObject)));
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError('\'pathObject.root\' must be a string or undefined, not ' + _typeof(pathObject.root));
  }

  var dir = pathObject.dir;
  var base = pathObject.base || '';
  if (!dir) {
    return base;
  }
  if (dir[dir.length - 1] === win32.sep) {
    return dir + base;
  }
  return dir + win32.sep + base;
};

win32.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError('Parameter \'pathString\' must be a string, not ' + (typeof pathString === 'undefined' ? 'undefined' : _typeof(pathString)));
  }
  var allParts = win32SplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError('Invalid path \'' + pathString + '\'');
  }
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};

win32.sep = '\\';
win32.delimiter = ';';

var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};

function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

posix.resolve = function () {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();

    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path[0] === '/';
  }

  resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
};

posix.normalize = function (path) {
  var isAbsolute = posix.isAbsolute(path),
      trailingSlash = path && path[path.length - 1] === '/';

  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

posix.isAbsolute = function (path) {
  return path.charAt(0) === '/';
};

posix.join = function () {
  var path = '';
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return posix.normalize(path);
};

posix.relative = function (from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);

  var fromParts = trimArray(from.split('/'));
  var toParts = trimArray(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var _i2 = samePartsLength; _i2 < fromParts.length; _i2++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

posix._makeLong = function (path) {
  return path;
};

posix.dirname = function (path) {
  var result = posixSplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    return '.';
  }

  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};

posix.basename = function (path, ext) {
  var f = posixSplitPath(path)[2];

  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

posix.extname = function (path) {
  return posixSplitPath(path)[3];
};

posix.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError('Parameter \'pathObject\' must be an object, not ' + (typeof pathObject === 'undefined' ? 'undefined' : _typeof(pathObject)));
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError('\'pathObject.root\' must be a string or undefined, not ' + _typeof(pathObject.root));
  }

  var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
  var base = pathObject.base || '';
  return dir + base;
};

posix.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError('Parameter \'pathString\' must be a string, not ' + (typeof pathString === 'undefined' ? 'undefined' : _typeof(pathString)));
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError('Invalid path \'' + pathString + '\'');
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';

  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};

posix.sep = '/';
posix.delimiter = ':';

if (isWindows) {
  module.exports = win32;
} else {
    module.exports = posix;
  }

module.exports.posix = posix;
module.exports.win32 = win32;