type FulfilledAsyncMonad<T> = [isRejected: false, error: undefined, value: T];
type RejectedAsyncMonad = [isRejected: true, error: unknown, value: undefined];

export type AsyncMonad<T> = FulfilledAsyncMonad<T> | RejectedAsyncMonad;

export const wrapMonad = async <T>(asyncAction: () => Promise<T>): Promise<AsyncMonad<T>> => {
  try {
    const value = await asyncAction();

    return [false, undefined, value];
  } catch (error) {
    return [true, error, undefined];
  }
}