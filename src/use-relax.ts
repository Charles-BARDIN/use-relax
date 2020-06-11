export type RelaxRequestInput<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxRequest<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxParameterPredicate<U extends any[]> = (args1: U, args2: U) => boolean;

const isSameParameters = <U extends any[]>(args1: U, args2: U) =>
  args1.every((arg, i) => arg === args2[i]);

const parameterToRelaxedPromisesMapFactory = <T, U extends any[]>(
  parametersPredicate: RelaxParameterPredicate<U>
) => {
  const map = new Map<U, Promise<T>>();

  const getPromise = (args: U): Promise<T> | undefined => {
    const parameters = getParameters(args);
    if (!parameters) {
      return;
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

  const hasParameters = (args: U): boolean => getParameters(args) !== undefined;

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

  return {
    getPromise,
    setPromise,
    removePromise,
    hasParameters,
    getParameters,
  };
};

/**
 *
 * @param request
 * @param parametersPredicate
 */
export const useRelax = <T, U extends any[]>(
  request: RelaxRequestInput<T, U>,
  parametersPredicate: RelaxParameterPredicate<U> = isSameParameters
): RelaxRequest<T, U> => {
  const parameterToRelaxedPromisesMap = parameterToRelaxedPromisesMapFactory<T, U>(
    parametersPredicate
  );

  return async (...args: U) => {
    if (!parameterToRelaxedPromisesMap.hasParameters(args)) {
      parameterToRelaxedPromisesMap.setPromise(request(...args), args);
    }

    const relaxedPromise = parameterToRelaxedPromisesMap.getPromise(args) as Promise<T>;
    try {
      return await relaxedPromise;
    } catch (e) {
      throw e;
    } finally {
      parameterToRelaxedPromisesMap.removePromise(args);
    }
  };
};
