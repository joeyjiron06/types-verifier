const Types = require('./index');

describe('Types', () => {
  const createPrimitiveTests = (primitiveName, mappedName = primitiveName) => {
    const values = [
      true, // Boolean
      null, // Null
      1234, // Number
      'string', // String
      function func() {}, // Function
      {}, // Object
      [], // Array
      Symbol('symbol'), // Symbol
      // undefined, // Undefined skipping undefined because it's covered in createTypeChekcer
    ];

    const toString = value => Object.prototype.toString.call(value).toLowerCase();
    const isValofType = value => `[object ${primitiveName}]` === toString(value);

    describe(mappedName, () => {
      it('should return null if validation succeeds', () => {
        const value = values.find(v => isValofType(v));
        expect(Types[mappedName](value)).toBe(null);
      });

      values
        .filter(val => !isValofType(val))
        .forEach((value) => {
          it(`should return a TypeError when validation fails with ${toString(value)}`, () => {
            expect(Types[mappedName](value)).toBeInstanceOf(TypeError);
            expect(Types[mappedName].isRequired(value)).toBeInstanceOf(TypeError);
          });
        });
    });
  };

  // all these tests are almost exactly similar so they are
  // dynamically generated
  createPrimitiveTests('string');
  createPrimitiveTests('number');
  createPrimitiveTests('boolean');
  createPrimitiveTests('object');
  createPrimitiveTests('array');
  createPrimitiveTests('function', 'func');

  describe('createTypeVerifier', () => {
    const customChecker = Types.createTypeVerifier((value) => {
      if (value === 123) {
        return new TypeError('should not be 123');
      }

      return null;
    });

    it('should return null when undefined is given to a non-required validator', () => {
      expect(customChecker(undefined)).toBe(null);
    });

    it('should return TypeError when undefined is given to a required validator', () => {
      expect(customChecker.isRequired(undefined)).toBeInstanceOf(TypeError);
    });
  });

  describe('any', () => {
    [
      true, // Boolean
      null, // Null
      undefined, // Undefined
      1234, // Number
      'string', // String
      function func() {}, // Function
      {}, // Object
      [], // Array
      Symbol('symbol'), // Symbol
    ].forEach((value) => {
      it(`should return null value is ${String(value)}`, () => {
        expect(Types.any(value)).toBe(null);
      });
    });

    it('should return a TypeError when value is undefined but value is required', () => {
      const result = Types.any.isRequired(undefined, 'propName');
      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toBe("propName is required but you provided 'undefined'");
    });
  });

  describe('oneOf', () => {
    it('should return null when value is in the list', () => {
      const oneOf = Types.oneOf(['hi', 'world']);
      expect(oneOf('hi')).toBe(null);
      expect(oneOf('world')).toBe(null);
    });

    it('should return an error when value is not in list', () => {
      const oneOf = Types.oneOf(['hi', 'world']);

      [
        true, // Boolean
        1234, // Number
        'string', // String
        function func() {}, // Function
        {}, // Object
        [], // Array
        Symbol('symbol'), // Symbol
      ].forEach((value) => {
        expect(oneOf(value)).toBeInstanceOf(TypeError);
        expect(oneOf.isRequired(value)).toBeInstanceOf(TypeError);
      });
    });
  });

  describe('arrayOf', () => {
    it('should return null when array matches spec', () => {
      const arrayOf = Types.arrayOf(Types.number);
      const result = arrayOf([1, 2, 4]);
      expect(result).toBe(null);
    });
    it('should return a TypeError when array doesnt match spec', () => {
      const arrayOf = Types.arrayOf(Types.number);
      const result = arrayOf([1, 2, '4'], 'prop');
      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toContain("prop[2] must be a number but you provided '4'");
    });
  });

  describe('shape', () => {
    it('should return null when shape matches spec', () => {
      const shape = Types.shape({
        hello: Types.number.isRequired,
        world: Types.string.isRequired,
      });
      const result = shape({
        hello: 12,
        world: 'hi!',
      });
      expect(result).toBe(null);
    });

    it('should return a TypeError when shape doesnt match spec', () => {
      const shape = Types.shape({
        hello: Types.number.isRequired,
        world: Types.string.isRequired,
      });
      const result = shape(
        {
          hello: 'broken',
          world: false,
        },
        'item',
      );
      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toContain(
        'item["hello"] must be a number but you provided \'broken\'',
      );
      expect(result.message).toContain('item["world"] must be a string but you provided \'false\'');
    });
  });

  describe('checkTypes', () => {
    it('should return null when the object is valid', () => {
      const types = {
        id: Types.number.isRequired,
        name: Types.string.isRequired,
        admin: Types.boolean.isRequired,
        roles: Types.array.isRequired,
      };
      const obj = {
        id: 123,
        name: 'adsf',
        admin: false,
        roles: ['user'],
      };

      expect(Types.checkTypes(types, obj)).toBe(null);
    });

    it('should return Error when object does not match types', () => {
      const types = {
        id: Types.number.isRequired,
        name: Types.string.isRequired,
        admin: Types.boolean.isRequired,
        hello: Types.object.isRequired,
        what: Types.oneOf(['hi', 'yes']).isRequired,
      };
      const obj = {
        id: 'asdf',
        name: 'adsf',
        admin: 'asdf',
        what: 123,
      };

      const error = Types.checkTypes(types, obj);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("id must be a number but you provided 'asdf'");
      expect(error.message).toContain("admin must be a boolean but you provided 'asdf'");
      expect(error.message).toContain("hello is required but you provided 'undefined'");
      expect(error.message).toContain("what must be one of [hi, yes] but you provided '123'");
    });
  });
});
