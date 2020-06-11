# use-relax
**Relax** your async methods calls !

`use-relax` is written in Typescript and contains only a single function `useRelax` that allows memorize an async method call. Once "relaxed", your async method will only be called once at a time with the same parameters.

## Installation
`use-relax` can be installed through `yarn` and `npm`.

To install from npm, run:

`npm install use-relax`

To install from yarn, run:

`yarn add use-relax`

## Usage
`useRelax` takes as an argument the async method to relax.

```typescript
// Import some chillness
import { useRelax } from 'use-relax';

const myAsyncFunction = async (value1: string, value2: number) =>
  new Promise<string>((yeah) => {
    setTimeout(() => {
      console.log(`Called with "${value1}" and "${value2}"`)
      yeah(value1 + value2.toString())
    }, 1000);
  });

// Relax that async function
const myRelaxedFunction = useRelax(myAsyncFunction);

// myAsyncFunction is only called once, easy ! 
await Promise.all([
  myRelaxedFunction('relax', 420), 
  myRelaxedFunction('relax', 420), 

  myRelaxedFunction('stay cool', 420)
]);

// Logs:
// Called with "relax" and "420"
// Called with "stay cool" and "420"
```

## Development
### Prerequisites
The project has been developed with `NodeJS v12.18.0` and `yarn v1.22.4`.
To install the dependencies, run:

`yarn install`

### Launch tests
To run the tests, run:

`yarn test`

### Build project
To build the project, run:

`yarn build`

The build will be available in the `dist/` directory.
