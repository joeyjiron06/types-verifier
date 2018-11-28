# types-verifier

[![Build Status](https://cloud.drone.io/api/badges/joeyjiron06/types-verifier/status.svg)](https://cloud.drone.io/joeyjiron06/types-verifier)

A super lightweight runtime type checking for javascript values ands objects. Very similar to [prop-types](https://github.com/facebook/prop-types), expect that this package solves [this issue](https://github.com/facebook/prop-types/issues/34) with `prop-types`.


You can use types-verifier verify against the type definitions, and return an error if they don’t match.

## Installation

```
npm install --save types-verifier
```

## Importing

```javascript
import PropTypes from 'prop-types'; // ES6
var PropTypes = require('prop-types'); // ES5 with npm
```

## Usage

Here is an example usage of `types-verifier` which also documents the different validators provided.

```javascript
import Types from 'types-verifier';

const UserType = {
  // You can declare that a prop is a specific JS primitive. By default, these
  // are all optional. To make it required just add .isRequired to any validator
  array: PropTypes.array,
  bool: PropTypes.bool,
  func: PropTypes.func,
  number: PropTypes.number,
  object: PropTypes.object,
  string: PropTypes.string,

  // You can ensure that your prop is limited to specific values by treating
  // it as an enum.
  enum: PropTypes.oneOf(['News', 'Photos']),

  // An array of a certain type
  arrayOf: PropTypes.arrayOf(PropTypes.number),


  
  // An object taking on a particular shape
  objectWithShape: PropTypes.shape({
    property: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),


  //
  requiredFunc: PropTypes.func.isRequired,

  // A value of any data type
  requiredAny: PropTypes.any.isRequired,


  // You can also specify a custom verifier. It should return an Error
  // object if the validation fails. Don't `console.warn` or throw;
  // it should return null if verification succeeds.
  customProp: Types.create function(value, propName) {
    if (!/matchme/.test(value)) {
      return new TypeError(`${propName} must matchme, but you supplied ${String(value)}`);
    }

    return null;
  }
};

const result = Types.checkTypes(UserType, {
  hello: 'world'
});

// result will be a TypeError with a message of ALL the errors describing why
// the object does not match the type definition
```


## Motivation

I would love to use [prop-types](https://github.com/facebook/prop-types) from facebook because it's a very solid peice of code. The main issue that that it cannot be easily used outside for react - see the issue [here](https://github.com/facebook/prop-types/issues/34). In a nutshell, `prop-types` returns "shims" (no-op functions that don't do anything) when in production mode, which is does not support all use cases.

There are plenty of other libraries that are trying to solve the same problem as `prop-types`, but none of them quite fit my needs. Here are the projects I found:

https://github.com/hustcc/variable-type
https://github.com/dbrekalo/validate-types
https://github.com/andnp/ValidTyped
https://github.com/david-martin/types-validator

Those projects are great, but I really need a validator like `prop-types` that will return ALL the error messages when I check on object againts a type definition. When debugging and finding out what is wrong with your software, it is VERY helpful to have really good error messages, which is why I love `prop-types` so much. None of the libraries above give you all the errors. That is why i decided to create this package.