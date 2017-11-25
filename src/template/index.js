import defaultExprTypesDefine from './defaultExprTypesDefine';

import createScopeClass from './createScopeClass';
import createExpressionClass from './createExpressionClass';
import createScopeLayerClass from './createScopeLayerClass';

export {
  defaultExprTypesDefine,
};

export class SvTemplate {
  constructor(config) {
    this._config = config;
    this._ExpressionClass = createExpressionClass(this._config);
    this._ScopeClass = createScopeClass(this._ExpressionClass);
    this._ScopeLayerClass = createScopeLayerClass(this._ExpressionClass, this._ScopeClass);
  }

  getScopeLayerClass() {
    return this._ScopeLayerClass;
  }

  getScopeClass() {
    return this._ScopeClass;
  }

  getExpressionClass() {
    return this._ExpressionClass;
  }
}

