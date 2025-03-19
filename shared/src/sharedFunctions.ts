function isTypedObject(value: unknown): value is { type: string } {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        typeof (value as any).type === "string"
    );
}

function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }
  

export {
    isTypedObject,
    isDefined
}