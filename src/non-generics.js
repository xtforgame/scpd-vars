export class SvVariable {
  constructor(scope, name) {
    this._scope = scope;
    const parentPrefixString = '$parent.';
    if (name.length > parentPrefixString.length && name.substr(0, parentPrefixString.length) === parentPrefixString) {
      this._type = 'parent';
      this._name = name.substr(parentPrefixString.length);
    } else {
      this._name = name;
    }
  }

  eval(evalingSet) {
    if (this._type === 'parent') {
      return this._scope.evalVarExternal(this._name, evalingSet);
    }
    return this._scope.evalVar(this._name, evalingSet);
  }

  toString() {
    return `\${${this._name}}`;
  }
}

export class SvExprInfo {
  constructor(typeName, exprBody, defaultValue, typeConfig, rawData) {
    this.typeName = typeName;
    this.exprBody = exprBody;
    this.default = defaultValue;
    this.typeConfig = typeConfig;
    this.rawData = rawData;

    this.tokens = [];
  }

  setTokens(tokens) {
    this.tokens = tokens;
  }

  toString() {
    return `\${${this._name}}`;
  }
}

