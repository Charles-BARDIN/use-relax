export type RelaxRequestInput<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxRequest<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxParameterPredicate<U extends any[]> = (args1: U, args2: U) => boolean;

const isSameParameters = <U extends any[]>(args1: U, args2: U) =>
  args1.every((arg, i) => arg === args2[i]);

const parameterToRelaxedPromisesMapFactory = <T, U extends any[]>(
  parametersPredicate: RelaxParameterPredicate<U>
) => {
  const map = new Map<U, Promise<T>>();

  const getParameters = (args: U): U | undefined =>
    [...map.keys()].find((key) => {
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

  const hasParameters = (args: U): boolean => getParameters(args) !== undefined;

  const getPromise = (args: U): Promise<T> | undefined => {
    const parameters = getParameters(args);
    if (!parameters) {
      return undefined;
    }

    return map.get(parameters);
  };

  const setPromise = (promise: Promise<T>, args: U) => {
    if (hasParameters(args)) {
      return;
    }

    map.set(args, promise);
  };

  const removePromise = (args: U) => {
    const parameters = getParameters(args);
    if (!parameters) {
      return;
    }

    map.delete(parameters);
  };

  return {
    getPromise,
    setPromise,
    removePromise,
    hasParameters,
    getParameters,
  };
};

/**
 * Prevents an async method to be called multiple times with the same parameters if the Promise is still pending.
 * @param request The async request to relax
 * @param parametersPredicate A method used to determine parameters equality
 */
export const useRelax = <PromiseResponseType, ParametersTypes extends any[]>(
  request: RelaxRequestInput<PromiseResponseType, ParametersTypes>,
  parametersPredicate: RelaxParameterPredicate<ParametersTypes> = isSameParameters
): RelaxRequest<PromiseResponseType, ParametersTypes> => {
  const parameterToRelaxedPromisesMap = parameterToRelaxedPromisesMapFactory<
    PromiseResponseType,
    ParametersTypes
  >(parametersPredicate);

  return async (...args: ParametersTypes) => {
    if (!parameterToRelaxedPromisesMap.hasParameters(args)) {
      parameterToRelaxedPromisesMap.setPromise(request(...args), args);
    }

    const relaxedPromise = parameterToRelaxedPromisesMap.getPromise(args) as Promise<
      PromiseResponseType
    >;
    try {
      return await relaxedPromise;
    } finally {
      parameterToRelaxedPromisesMap.removePromise(args);
    }
  };
};
