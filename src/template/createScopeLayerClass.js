import {
  SvScopeChain,
} from '../scope-chain';

export default function createScopeLayerClass(SvExpression, SvScope) {
  const newScopeLayerClass = class SvScopeLayer {
    static ExpressionClass = SvExpression;
    static ScopeClass = SvScope;
    static TempNodeNameForQuery = ['head', 'before', 'after'];

    constructor(scopChain, options) {
      this._scopChain = scopChain;
      this._options = options;

      this._nodeDefines = {
        placeHolder: {
          insert: () => (null),
        },
        head: {
          insert: () => (this._scopChain.head),
        },
        main: {
          insert: () => (this.node('placeHolder')),
          onCreated: (node, scope) => {
            this._mainScope = scope;
            this._lastNode = node;
          },
        },
        before: {
          insert: () => (this.node('main')),
        },
        after: {
          insert: () => (this.node('main').next),
          onCreated: node => (this._lastNode = node),
        },
        queryBody: {
          insert: () => ((this.node('after') || this.node('main')).next),
          onCreated: node => (this._lastNode = node),
        },
      };
      this._mainScope = null;
      this._firstNode = this._scopChain.pushBack(new SvScopeChain.Placeholder());
      this._lastNode = this._firstNode;
    }

    node(nodeName) {
      return this._nodeDefines[nodeName].node;
    }

    scope(nodeName) {
      return this._nodeDefines[nodeName].scope;
    }

    _createNode(name, varData, options) {
      this._removeNode(name);

      options = Object.assign({}, options || {}, {
        findVar: this._scopChain.findVar,
      });
      const scope = new SvScope(varData, options);

      const insertPosFunc = this._nodeDefines[name].insert || (() => null);
      const onCreated = this._nodeDefines[name].onCreated || (() => null);
      this._nodeDefines[name].scope = scope;
      this._nodeDefines[name].node = this._scopChain.insert(scope, insertPosFunc());
      const node = this._nodeDefines[name].node;
      onCreated(node, scope, name);
      return node;
    }

    _removeNode(name) {
      if (!this._nodeDefines[name].scope) {
        return false;
      }

      const { scope, node } = this._nodeDefines[name];
      const prevNode = node.prev;
      const onRemoved = this._nodeDefines[name].onRemoved || (_node => null);
      this._scopChain.delete(this._nodeDefines[name].scope);
      this._nodeDefines[name].scope = null;
      this._nodeDefines[name].node = null;
      if (this._lastNode === node) {
        this._lastNode = prevNode;
      }
      onRemoved(node, scope, name);
      return true;
    }

    initScope(varData, options) {
      return this._createNode('main', varData, options);
    }

    evalVars() {
      return this._mainScope && this._mainScope.evalVars();
    }

    getEvaledVars() {
      return this._mainScope && this._mainScope.getEvaledVars();
    }

    evalVar(varName) {
      return this._lastNode.data.evalVar(varName, new Set());
    }

    eval(exprRawData) {
      return SvExpression.parseAndEval(this._lastNode.data, '@one-off', exprRawData, new Set());
    }

    _setupNodesBeforeQuery(varDataMap) {
      varDataMap = varDataMap || {};
      newScopeLayerClass.TempNodeNameForQuery.forEach((name) => {
        if (name in varDataMap) {
          const node = this._createNode(name, varDataMap[name]);
          node.data.evalVars();
        }
      });
    }

    _cleanNodesAfterQuery() {
      this._removeNode('queryBody');
      newScopeLayerClass.TempNodeNameForQuery.forEach((name) => {
        this._removeNode(name);
      });
    }

    query(exprRawData, varDataMap) {
      let result = null;
      try {
        this._setupNodesBeforeQuery(varDataMap);
        if (Array.isArray(exprRawData)) {
          result = exprRawData.map(expr => this.eval(expr));
        } else {
          result = this.eval(exprRawData);
        }
      } catch (e) {
        this._cleanNodesAfterQuery();
        throw e;
      }
      this._cleanNodesAfterQuery();
      return result;
    }

    compile(srcVarData, varDataMap) {
      let result = null;
      try {
        this._setupNodesBeforeQuery(varDataMap);
        const node = this._createNode('queryBody', srcVarData);
        result = node.data.evalVars();
      } catch (e) {
        this._cleanNodesAfterQuery();
        throw e;
      }
      this._cleanNodesAfterQuery();
      return result;
    }
  };
  return newScopeLayerClass;
}
