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
    const relaxed = useRelax(methodToRelax, arg1, arg2);

    await relaxed();

    expect(methodToRelax).toHaveBeenCalled();
    expect(methodToRelax).toHaveBeenCalledWith(arg1, arg2);
  });

  it('Should call the method to relax only once if called multiple times before resolving', async () => {
    methodToRelax = jest.fn(
      () =>
        new Promise((yeah) => {
          setTimeout(yeah, 100);
        })
    );

    const relaxed = useRelax(methodToRelax, arg1);

    await Promise.all([relaxed(), relaxed()]);

    expect(methodToRelax).toHaveBeenCalledTimes(1);
  });

  it('Should call the method another time if the previous call is resolved', async () => {
    methodToRelax = jest.fn(() => Promise.resolve('MOCKED_RESOLVE'));

    const relaxed = useRelax(methodToRelax, arg1);

    await relaxed();
    await relaxed();

    expect(methodToRelax).toHaveBeenCalledTimes(2);
  });

  it('Should throw an error if the method to relax throws an error', async () => {
    methodToRelax = jest.fn(
      () =>
        new Promise(() => {
          throw new Error('MOCKED_ERROR');
        })
    );

    const relaxed = useRelax(methodToRelax, arg1);

    await expect(relaxed()).toReject();
  });

  it('Should return the data returned by the method to relax', async () => {
    const data = 'MOCKED_DATA';
    methodToRelax = jest.fn(() => new Promise((yeah) => yeah(data)));

    const relaxed = useRelax(methodToRelax, arg1);

    expect(await relaxed()).toBe(data);
  });
});
