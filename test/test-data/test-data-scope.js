'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TestDataScopeNormal01 = exports.TestDataScopeNormal01 = {
  var1: '@eexpr:1${var2}',
  var2: '@eexpr:2${var3}',
  var3: '@eexpr:3${var4}',
  var4: '@eexpr:4${var5}',
  var5: '@eexpr:5${var6}',
  var6: '@eexpr:6${var7}',
  var7: '@eexpr:7${var8}',
  var8: '@eexpr:8${var9}',
  var9: '@eexpr:9'
};

var TestDataScopeNormal02 = exports.TestDataScopeNormal02 = Object.assign({}, TestDataScopeNormal01, {
  var6: {
    exprType: '@eexpr',
    exprBody: '5${var11}',
    default: '@eexpr:6${var7}'
  },
  var5: {
    exprType: '@eexpr',
    exprBody: '5${var6}'
  }
});

var TestDataScopeRecu01 = exports.TestDataScopeRecu01 = Object.assign({}, TestDataScopeNormal01, {
  var9: '@eexpr:9${var1}'
});

var TestDataScopeRecu02 = exports.TestDataScopeRecu02 = Object.assign({}, TestDataScopeNormal02, {
  var9: '@eexpr:9${var1}'
});

var TestDataScopePartA01 = exports.TestDataScopePartA01 = {
  var6: '@eexpr:A6${var7}',
  var7: '@eexpr:A7${var8}',
  var8: '@eexpr:A8${var9}',
  var9: '@eexpr:A9'
};

var TestDataScopePartB01 = exports.TestDataScopePartB01 = {
  var1: '@eexpr:B1${var2}',
  var2: '@eexpr:B2${var3}',
  var3: '@eexpr:B3${var4}',
  var4: '@eexpr:B4${var5}',
  var5: {
    exprType: '@eexpr',
    exprBody: 'B5${var6}'
  },
  var6: '@eexpr:B6${var7}',
  var7: '@eexpr:B7${var8}'
};

var TestDataScopePartA02 = exports.TestDataScopePartA02 = Object.assign({}, TestDataScopePartA01);

var TestDataScopePartB02 = exports.TestDataScopePartB02 = Object.assign({}, TestDataScopePartB01, {
  var5: {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        B6B7A8A9: 'B5B6B7A8A9(cases)'
      },
      default: '@eexpr:B5${var6}(default)'
    }
  },
  'var5-2': {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        'B6B7A8A9-2': 'B5B6B7A8A9-2(cases)'
      },
      default: '@eexpr:B5${var6}(default)'
    }
  },
  'var5-3': {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        'B6B7A8A9-3': 'B5B6B7A8A9-3(cases)'
      }
    },
    default: '@eexpr:B5${var6}(default)'
  }
});