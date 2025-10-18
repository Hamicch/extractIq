/**
 * Result type for functional error handling
 * Inspired by Rust's Result<T, E> and Railway Oriented Programming
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  public static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  public getValueOrDefault(defaultValue: T): T {
    return this._isSuccess ? this._value! : defaultValue;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value!));
    }
    return Result.fail(this._error!);
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value!);
    }
    return Result.fail(this._error!);
  }

  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.ok(this._value!);
    }
    return Result.fail(fn(this._error!));
  }

  public match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this._isSuccess ? onSuccess(this._value!) : onFailure(this._error!);
  }
}
