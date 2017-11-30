export class SvVariable {
  static ParentVariable = 'parent';
  static Empty = 'empty';
  constructor(scope, name) {
    this._scope = scope;
    const parentPrefixString = '$parent.';
    if (name.length > parentPrefixString.length && name.substr(0, parentPrefixString.length) === parentPrefixString) {
      this._type = SvVariable.ParentVariable;
      this._name = name.substr(parentPrefixString.length);
    } else if (name === '') {
      this._type = SvVariable.Empty;
      this._name = name;
    } else {
      this._name = name;
    }
  }

  eval(evalingSet) {
    if (this._type === 'parent') {
      return this._scope.evalVarExternal(this._name, evalingSet);
    } else if (this._type === 'empty') {
      return '';
    }
    return this._scope.evalVar(this._name, evalingSet);
  }

  toString() {
    return `\${${this._name || '<empty>'}}`;
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

