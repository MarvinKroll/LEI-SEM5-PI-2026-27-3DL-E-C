export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier "${identifier}" was not found.`);
    this.name = 'EntityNotFoundError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}
