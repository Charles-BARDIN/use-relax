# use-relax
**Relax** your async methods calls !

`use-relax` is written in Typescript and contains only a single function `useRelax` that allows memorizing an async method call. Once "relaxed", your async method will only be called once at a time with the same parameters.

## Installation
`use-relax` can be installed through `yarn` and `npm`.

To install from npm, run:

`npm install use-relax`

To install from yarn, run:

`yarn add use-relax`

## Usage
`useRelax` takes as a first argument the async method to relax. The second argument is the configuration that allows setting a custom predicate for parameters equality and determine if the value returned should be memorized or not.

### Basic usage
With no configuration given, the equality of parameters is based on strict equality and the value is not memorized.

```typescript
import { useRelax } from 'use-relax';

const myAsyncFunction = async (value1: string, value2: number) =>
  new Promise<string>((yeah) => {
    setTimeout(() => {
      console.log(`Called with "${value1}" and "${value2}"`);
      yeah(value1 + value2.toString());
    }, 1000);
  });

const myRelaxedFunction = useRelax(myAsyncFunction);

await Promise.all([
  myRelaxedFunction('relax', 42), 
  myRelaxedFunction('relax', 42), 

  myRelaxedFunction('stay cool', 42)
]);
// Logs:
// Called with "relax" and "42"
// Called with "stay cool" and "42"

await myRelaxedFunction('relax', 42);
// Logs:
// Called with "relax" and "42"
```

### Configuration
The configuration is composed of two optional properties: `parametersPredicate` and `memorizeValue`.

`parametersPredicate` is a predicate function used to check if two list of arguments of the async function are equal. By default, it uses strict equality between arguments.
```typescript
const myCustomPredicate = <U extends any[]>(args1:: U, args2: U) =>
  args1.every((arg, index) => arg === args2[index]);

const myRelaxedFunction = useRelax(myAsyncFunction, { 
  parametersPredicate: myCustomPredicate,
});
// "myCustomPredicate" will be used to determine if two list of parameters are equal
```

`memorizeValue` is a boolean. If set to true, it will memorize the value returned by the async function. Default value is false.
```typescript
const myAsyncFunction = async (value1: string, value2: number) =>
  new Promise<string>((yeah) => {
    setTimeout(() => {
      console.log(`Called with "${value1}" and "${value2}"`);
      yeah(value1 + value2.toString());
    }, 1000);
  });

const myRelaxedFunction = useRelax(myAsyncFunction, {
  memorizeValue: true,
});

await Promise.all([
  myRelaxedFunction('relax', 42), 
  myRelaxedFunction('relax', 42), 

  myRelaxedFunction('stay cool', 42)
]);
// Logs:
// Called with "relax" and "42"
// Called with "stay cool" and "42"

await myRelaxedFunction('relax', 42);
// Logs nothing !
```

## Development
### Prerequisites
The project has been developed with `NodeJS v12.18.0` and `yarn v1.22.4`.
To install the dependencies, run:

`yarn install`

### Launch tests
To run the tests, run:

`yarn test`

To run the linter, run:

`yarn lint`

### Build project
To build the project, run:

`yarn build`

The build will be available in the `dist/` directory.
