/**
 * Base class for all entities
 * Entities are objects with identity that persist over time
 */
export abstract class BaseEntity {
  constructor(public readonly id: string) {}

  public equals(other: BaseEntity): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof this.constructor)) {
      return false;
    }

    return this.id === other.id;
  }
}
