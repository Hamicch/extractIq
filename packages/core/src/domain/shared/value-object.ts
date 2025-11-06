/**
 * Base class for value objects
 * Value objects are immutable objects without identity
 * They are compared by their attributes, not by reference
 */
export abstract class ValueObject<T> {
  constructor(protected readonly props: T) {}

  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  public getValue(): T {
    return this.props;
  }
}
