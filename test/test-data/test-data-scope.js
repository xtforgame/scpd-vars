export const TestDataScopeNormal01 = {
  var1: '@eexpr:1${var2}',
  var2: '@eexpr:2${var3}',
  var3: '@eexpr:3${var4}',
  var4: '@eexpr:4${var5}',
  var5: '@eexpr:5${var6}',
  var6: '@eexpr:6${var7}',
  var7: '@eexpr:7${var8}',
  var8: '@eexpr:8${var9}',
  var9: '@eexpr:9',
};

export const TestDataScopeNormal02 = Object.assign({}, TestDataScopeNormal01, {
  var6: {
    exprType: '@eexpr',
    exprBody: '5${var11}',
    default: '@eexpr:6${var7}',
  },
  var5: {
    exprType: '@eexpr',
    exprBody: '5${var6}',
  },
});

export const TestDataScopeRecu01 = Object.assign({}, TestDataScopeNormal01, {
  var9: '@eexpr:9${var1}',
});

export const TestDataScopeRecu02 = Object.assign({}, TestDataScopeNormal02, {
  var9: '@eexpr:9${var1}',
});

export const TestDataScopeDefaultValue = {
  var1: {
    default: '<not found>',
    exprBody: '${var10}',
    exprType: '@eexpr',
  },
};

export const TestDataScopeNotExpression = {
  var1: '@nexpr:@eexpr:1${var2}',
  var2: '2',
};

export const TestDataScopePartA01 = {
  var6: '@eexpr:A6${var7}',
  var7: '@eexpr:A7${var8}',
  var8: '@eexpr:A8${var9}',
  var9: '@eexpr:A9',
};

export const TestDataScopePartB01 = {
  var1: '@eexpr:B1${var2}',
  var2: '@eexpr:B2${var3}',
  var3: '@eexpr:B3${var4}',
  var4: '@eexpr:B4${var5}',
  var5: {
    exprType: '@eexpr',
    exprBody: 'B5${var6}',
  },
  var6: '@eexpr:B6${var7}',
  var7: '@eexpr:B7${var8}',
};

export const TestDataScopePartA02 = Object.assign({}, TestDataScopePartA01);

export const TestDataScopePartB02 = Object.assign({}, TestDataScopePartB01, {
  var5: {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        B6B7A8A9: 'B5B6B7A8A9(cases)',
      },
      default: '@eexpr:B5${var6}(default)',
    },
  },
  'var5-2': {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        'B6B7A8A9-2': 'B5B6B7A8A9-2(cases)',
      },
      default: '@eexpr:B5${var6}(default)',
    },
  },
  'var5-3': {
    exprType: '@dexpr',
    exprBody: {
      switch: '@eexpr:${var6}',
      cases: {
        'B6B7A8A9-3': 'B5B6B7A8A9-3(cases)',
      },
    },
    default: '@eexpr:B5${var6}(default)',
  },
});

export const TestDataScopePaths01 = {
  srcPath: '/a/b\\c\\../d/..\\e//f',
  opath: '@opath:${srcPath}',
  ppath: '@ppath:${srcPath}',
  wpath: '@wpath:${srcPath}',
};

export const TestDataScopeFunctionDefine01 = {
  fn01: {
    exprType: '@fndef',
    exprBody: {
      define: '@eexpr:${srcPath}${arg1}${arg2}',
      args: [
        ['arg1', '15'],
        'arg2',
      ],
    },
  },
  callf01: {
    exprType: '@callf',
    exprBody: {
      function: 'fn01',
      args: ['@eexpr:${srcPath}'],
      kvPairs: {
        arg2: '@eexpr:${srcPath}',
      },
    },
  },
  srcPath: 'xxx',
};
