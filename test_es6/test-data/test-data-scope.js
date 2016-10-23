export let TestDataScopeNormal01 = {
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

export let TestDataScopeNormal02 = Object.assign({}, TestDataScopeNormal01, {
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

export let TestDataScopeRecu01 = Object.assign({}, TestDataScopeNormal01, {
  var9: '@eexpr:9${var1}',
});

export let TestDataScopeRecu02 = Object.assign({}, TestDataScopeNormal02, {
  var9: '@eexpr:9${var1}',
});

export let TestDataScopePartA01 = {
  var6: '@eexpr:A6${var7}',
  var7: '@eexpr:A7${var8}',
  var8: '@eexpr:A8${var9}',
  var9: '@eexpr:A9',
};

export let TestDataScopePartB01 = {
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

export let TestDataScopePartA02 = Object.assign({}, TestDataScopePartA01);

export let TestDataScopePartB02 = Object.assign({}, TestDataScopePartB01, {
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

export let TestDataScopePaths01 = {
  srcPath: '/a/b\\c\\../d/..\\e//f',
  opath: '@opath:${srcPath}',
  ppath: '@ppath:${srcPath}',
  wpath: '@wpath:${srcPath}',
};
