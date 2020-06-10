export type RelaxRequestInput<T, U extends any[]> = (...args: U) => Promise<T>;
export type RelaxRequest<T> = () => Promise<T>;

export const useRelax = <T, U extends any[]>(
  request: RelaxRequestInput<T, U>,
  ...args: U
): RelaxRequest<T> => {
  let relaxedPromise: Promise<T> | undefined;

  return async () => {
    if (!relaxedPromise) {
      relaxedPromise = request(...args);
    }

    try {
      return await (() => relaxedPromise as Promise<T>)();
    } catch (e) {
      throw e;
    } finally {
      relaxedPromise = undefined;
    }
  };
};
