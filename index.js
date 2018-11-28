// inpsired by prop-types and variable-type
// prop-types currently doesn't validate in production, which is a problem for our use cases
// variable-type will validate object shapes only until an invalid value is found, whereas
// this code finds ALL errors and returns them so that you can determine exactly what is wrong

const defaultError = (type, value, propName) => `${propName || 'value'} must be a ${type} but you provided '${String(value)}'`;

const createTypeVerifier = (isValid) => {
  const validator = (value, propName) => {
    if (value === undefined) {
      return null;
    }

    return isValid(value, propName);
  };

  validator.isRequired = (value, propName) => {
    if (value === undefined) {
      return new TypeError(`${propName || 'value'} is required but you provided '${value}'`);
    }

    return validator(value, propName);
  };

  // returns null or error
  return validator;
};

const checkTypes = (types, obj, propName) => {
  const errors = [];

  Object.keys(types).forEach((typeName) => {
    const value = obj[typeName];
    const typeChecker = types[typeName];
    const isValid = typeChecker(value, propName ? `${propName}["${typeName}"]` : typeName);

    if (isValid instanceof Error) {
      errors.push(isValid);
    }
  });

  if (errors.length) {
    return new TypeError(errors.map(e => e.message).join('\n'));
  }

  return null;
};

const string = createTypeVerifier((value, propName) => {
  if (typeof value !== 'string') {
    return new TypeError(defaultError('string', value, propName));
  }

  return null;
});

const number = createTypeVerifier((value, propName) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return new TypeError(defaultError('number', value, propName));
  }

  return null;
});

const boolean = createTypeVerifier((value, propName) => {
  if (typeof value !== 'boolean') {
    return new TypeError(defaultError('boolean', value, propName));
  }

  return null;
});

const object = createTypeVerifier((value, propName) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return new TypeError(defaultError('object', value, propName));
  }

  return null;
});

const array = createTypeVerifier((value, propName) => {
  if (!Array.isArray(value)) {
    return new TypeError(defaultError('array', value, propName));
  }

  return null;
});

const func = createTypeVerifier((value, propName) => {
  if (typeof value !== 'function') {
    return new TypeError(defaultError('function', value, propName));
  }

  return null;
});

const any = createTypeVerifier(() => null);

const oneOf = values => createTypeVerifier((value, propName) => {
  if (!values.includes(value)) {
    return new TypeError(
      `${propName || 'value'} must be one of [${values.join(', ')}] but you provided '${String(
        value,
      )}'`,
    );
  }

  return null;
});

const arrayOf = typeChecker => createTypeVerifier((values, propName) => {
  const errors = values
    .map((value, index) => typeChecker(value, `${propName || 'value'}[${index}]`))
    .filter(e => e instanceof TypeError);

  if (errors.length) {
    return new TypeError(errors.join('\n'));
  }

  return null;
});

const shape = types => createTypeVerifier((value, propName) => checkTypes(types, value, propName));

/**
 * A super lightweight runtime type checking for javascript values ands objects.
 */
module.exports = {
  string,
  number,
  boolean,
  object,
  array,
  func,
  any,
  oneOf,
  arrayOf,
  shape,
  checkTypes,
  createTypeVerifier,
};
