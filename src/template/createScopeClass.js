import {
  createEmplyFindVarResult,
} from '../utils';

export default function createScopeClass(SvExpression) {
  const newScopeClass = class SvScope {
    static ExpressionClass = SvExpression;

    constructor(varData, options) {
      this._varData = varData;
      this._options = options || {};
      this._findVarFunc = this._options.findVar || this.findVarLocal.bind(this);

      this._varMap = {};
      this._evaled = false;
      if (this._options.autoEval) {
        this.evalVars();
      }
    }

    _evalVars() {
      const result = {};
      Object.keys(this._varMap).forEach((key) => {
        result[key] = this._varMap[key].eval(new Set());
      });
      return result;
    }

    evalVars() {
      Object.keys(this._varData).forEach((key) => {
        this._varMap[key] = SvExpression.parse(this, key, this._varData[key]);
      });

      const result = this._evalVars();
      this._evaled = true;
      return result;
    }

    getEvaledVars() {
      if (!this._evaled) {
        return null;
      }
      return this._evalVars();
    }

    evalVar(varName, evalingSet) {
      if (evalingSet.has(varName)) {
        throw new Error(`Circular dependencies occured :${varName}`);
      }
      evalingSet.add(varName);

      const findResult = this.findVarLocal(null, varName);
      if (!findResult.var) {
        evalingSet.delete(varName);
        throw new Error(`Eval failed, var name not found :${varName}`);
      }
      // if scope is changed, reset the evalingSet
      const newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
      const result = findResult.var.eval(newEvalingSet);
      evalingSet.delete(varName);
      return result;
    }

    evalVarExternal(varName, evalingSet) {
      const findResult = this.findVarExternal(varName);
      if (!findResult.var) {
        evalingSet.delete(varName);
        throw new Error(`Eval failed, var name not found :${varName}`);
      }
      // if scope is changed, reset the evalingSet
      const newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
      const result = findResult.var.eval(newEvalingSet);
      return result;
    }

    findVarExternal(varName) {
      return this._findVarFunc(this, varName);
    }

    findVarLocal(visitorScope, varName) {
      const result = createEmplyFindVarResult();

      if (visitorScope === this) {
        // to prevent infinite loop
        return result;
      }

      result.var = this._varMap[varName];
      if (result.var) {
        result.scope = this;
        return result;
      }

      return this.findVarExternal(varName);
    }
  };
  return newScopeClass;
}
