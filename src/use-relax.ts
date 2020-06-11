export type RelaxRequestInput<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxRequest<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxParametersPredicate<U extends any[]> = (args1: U, args2: U) => boolean;
export type RelaxConfig<U extends any[]> = {
  parametersPredicate?: RelaxParametersPredicate<U>;
  memorizeValue?: boolean;
};

const isSameParameters = <U extends any[]>(args1: U, args2: U) =>
  args1.every((arg, i) => arg === args2[i]);

const storeFactory = <T, U extends any[]>(parametersPredicate: RelaxParametersPredicate<U>) => {
  const map = new Map<U, T>();
  const keys: U = ([] as unknown) as U;

  const getKey = (args: U = [] as any): U | undefined =>
    keys.find((key) => {
      if (!(key && key.length !== 0)) {
        return !(args && args.length !== 0);
      }

      if (!(args && args.length !== 0)) {
        return !(key && key.length !== 0);
      }

      if (key.length !== args.length) {
        return false;
      }

      return parametersPredicate(key, args);
    });

  const hasKey = (args: U): boolean => getKey(args) !== undefined;

  const getValue = (args: U): T | undefined => {
    const parameters = getKey(args);
    if (!parameters) {
      return undefined;
    }

    return map.get(parameters);
  };

  const setValue = (value: T, args: U) => {
    if (hasKey(args)) {
      return;
    }

    keys.push(args);

    map.set(args, value);
  };

  const removeValue = (args: U) => {
    const parameters = getKey(args);
    if (!parameters) {
      return;
    }

    const keyIndex = keys.findIndex((key) => parametersPredicate(key, args));
    if (keyIndex < 0) {
      return;
    }

    keys.splice(keyIndex, 1);

    map.delete(parameters);
  };

  return {
    getValue,
    setValue,
    removeValue,
    hasKey,
    getKey,
  };
};

const promiseStoreFactory = <T, U extends any[]>(
  parametersPredicate: RelaxParametersPredicate<U>
) => {
  const { getKey, hasKey, getValue, setValue, removeValue } = storeFactory<Promise<T>, U>(
    parametersPredicate
  );

  const getParameters = (args: U): U | undefined => getKey(args);

  const hasParameters = hasKey;

  const getPromise = (args: U): Promise<T> | undefined => getValue(args);

  const setPromise = (promise: Promise<T>, args: U) => setValue(promise, args);

  const removePromise = (args: U) => removeValue(args);

  return {
    getPromise,
    setPromise,
    removePromise,
    hasParameters,
    getParameters,
  };
};

const valueStoreFactory = <T, U extends any[]>(
  parametersPredicate: RelaxParametersPredicate<U>
) => {
  const {
    getKey,
    hasKey,
    getValue: storeGetValue,
    setValue: storeSetValue,
    removeValue: storeRemoveValue,
  } = storeFactory<T, U>(parametersPredicate);

  const getParameters = (args: U): U | undefined => getKey(args);

  const hasParameters = hasKey;

  const getValue = (args: U): T | undefined => storeGetValue(args);

  const setValue = (promise: T, args: U) => storeSetValue(promise, args);

  const removeValue = (args: U) => storeRemoveValue(args);

  return {
    getValue,
    setValue,
    removeValue,
    hasParameters,
    getParameters,
  };
};

/**
 * Prevents an async function to be called multiple times with the same parameters if the Promise is still pending.
 * The value returned by the async function can be memorized.
 * @param request The async request to relax.
 * @param config The configuration useRelax should use.
 */
export const useRelax = <PromiseResponseType, ParametersTypes extends any[]>(
  request: RelaxRequestInput<PromiseResponseType, ParametersTypes>,
  config: RelaxConfig<ParametersTypes> = {
    parametersPredicate: isSameParameters,
    memorizeValue: false,
  }
): RelaxRequest<PromiseResponseType, ParametersTypes> => {
  const parametersPredicate = config.parametersPredicate || isSameParameters;
  const memorizeValue = config.memorizeValue === true;

  const promisesStore = promiseStoreFactory<PromiseResponseType, ParametersTypes>(
    parametersPredicate
  );
  const valuesStore = valueStoreFactory<PromiseResponseType, ParametersTypes>(parametersPredicate);

  return async (...args: ParametersTypes) => {
    if (memorizeValue) {
      if (valuesStore.hasParameters(args)) {
        return valuesStore.getValue(args) as PromiseResponseType;
      }
    }

    if (!promisesStore.hasParameters(args)) {
      promisesStore.setPromise(request(...args), args);
    }

    const relaxedPromise = promisesStore.getPromise(args) as Promise<PromiseResponseType>;
    try {
      const value = await relaxedPromise;
      if (memorizeValue) {
        valuesStore.setValue(value, args);
      }

      return value;
    } finally {
      promisesStore.removePromise(args);
    }
  };
};
