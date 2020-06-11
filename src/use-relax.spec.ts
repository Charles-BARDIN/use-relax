import 'jest-extended';

import { useRelax } from './use-relax';

let methodToRelax: (arg: number, arg2?: string) => Promise<string>;
let arg1: number;
let arg2: string;

describe('useRelax', () => {
  beforeEach(() => {
    arg1 = 1;
    arg2 = '!';
    methodToRelax = jest.fn().mockResolvedValue('MOCKED_RETURN');
  });

  it('Should return a method that calls the method to relax with the given arguments', async () => {
    const relaxed = useRelax(methodToRelax);

    await relaxed(arg1, arg2);

    expect(methodToRelax).toHaveBeenCalled();
    expect(methodToRelax).toHaveBeenCalledWith(arg1, arg2);
  });

  it('Should call the method to relax only once if called multiple times with the same parameters before resolving', async () => {
    methodToRelax = jest.fn(
      async () =>
        new Promise<string>((yeah) => {
          setTimeout(() => yeah('MOCKED_RETURN'), 100);
        })
    );

    const relaxed = useRelax(methodToRelax);

    await Promise.all([relaxed(arg1), relaxed(arg1)]);

    expect(methodToRelax).toHaveBeenCalledTimes(1);
  });

  it('Should call the method to relax multiple if called multiple times with different parameters before resolving', async () => {
    methodToRelax = jest.fn(
      async () =>
        new Promise<string>((yeah) => {
          setTimeout(() => yeah('MOCKED_RETURN'), 100);
        })
    );

    const relaxed = useRelax(methodToRelax);

    await Promise.all([relaxed(arg1), relaxed(2)]);

    expect(methodToRelax).toHaveBeenCalledTimes(2);
  });

  it('Should call the method another time if the previous call is resolved', async () => {
    methodToRelax = jest.fn(() => Promise.resolve('MOCKED_RESOLVE'));

    const relaxed = useRelax(methodToRelax);

    await relaxed(arg1);
    await relaxed(arg1);

    expect(methodToRelax).toHaveBeenCalledTimes(2);
  });

  it('Should throw an error if the method to relax throws an error', async () => {
    methodToRelax = jest.fn(
      () =>
        new Promise(() => {
          throw new Error('MOCKED_ERROR');
        })
    );

    const relaxed = useRelax(methodToRelax);

    await expect(relaxed(arg1)).toReject();
  });

  it('Should return the data returned by the method to relax', async () => {
    const data = 'MOCKED_DATA';
    methodToRelax = jest.fn(() => new Promise((yeah) => yeah(data)));

    const relaxed = useRelax(methodToRelax);

    expect(await relaxed(arg1)).toBe(data);
  });

  describe('With a parametersPredicate given', () => {
    it('Should use the predicate given to determine parameters equality', async () => {
      const predicate = jest.fn(() => true);

      const relaxed = useRelax(methodToRelax, { parametersPredicate: predicate });

      await relaxed(arg1);

      expect(predicate).toHaveBeenCalled();
    });
  });

  describe('With the value memorized', () => {
    it('Should call the async method if no Promise has been resolved with these parameters', async () => {
      methodToRelax = jest.fn(() => new Promise((yeah) => yeah('MOCKED_RETURN')));

      const relaxed = useRelax(methodToRelax, { memorizeValue: true });

      await relaxed(arg1);

      expect(methodToRelax).toHaveBeenCalledTimes(1);
      expect(methodToRelax).toHaveBeenCalledWith(arg1);
    });

    it('Should not call the async method if a Promise has been resolved with these parameters', async () => {
      methodToRelax = jest.fn(() => new Promise((yeah) => yeah('MOCKED_RETURN')));

      const relaxed = useRelax(methodToRelax, { memorizeValue: true });

      await relaxed(arg1);
      await relaxed(arg1);

      expect(methodToRelax).toHaveBeenCalledTimes(1);
      expect(methodToRelax).toHaveBeenCalledWith(arg1);
    });

    it('Should call the async method if no Promise has been resolved with these parameters if the async method returns nothing', async () => {
      methodToRelax = jest.fn(() => new Promise((yeah) => yeah()));

      const relaxed = useRelax(methodToRelax, { memorizeValue: true });

      await relaxed(arg1);

      expect(methodToRelax).toHaveBeenCalledTimes(1);
      expect(methodToRelax).toHaveBeenCalledWith(arg1);
    });

    it('Should not call the async method if a Promise has been resolved with these parameters if the async method returns nothing', async () => {
      methodToRelax = jest.fn(() => new Promise((yeah) => yeah()));

      const relaxed = useRelax(methodToRelax, { memorizeValue: true });

      await relaxed(arg1);
      await relaxed(arg1);

      expect(methodToRelax).toHaveBeenCalledTimes(1);
      expect(methodToRelax).toHaveBeenCalledWith(arg1);
    });

    it('Should call the async method if no Promise has been resolved with these parameters if the async method has no parameters', async () => {
      const asyncMethod = jest.fn(() => new Promise((yeah) => yeah()));

      const relaxed = useRelax(asyncMethod, { memorizeValue: true });

      await relaxed();

      expect(asyncMethod).toHaveBeenCalledTimes(1);
      expect(asyncMethod).toHaveBeenCalledWith();
    });

    it('Should not call the async method if a Promise has been resolved with these parameters if the async method has no parameters', async () => {
      const asyncMethod = jest.fn(() => new Promise((yeah) => yeah()));

      const relaxed = useRelax(asyncMethod, { memorizeValue: true });

      await relaxed();
      await relaxed();

      expect(asyncMethod).toHaveBeenCalledTimes(1);
      expect(asyncMethod).toHaveBeenCalledWith();
    });
  });
});
