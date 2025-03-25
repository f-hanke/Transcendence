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

function generateUniqueId(): string {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

function colog(any: any)
{
  console.log(any);
}

function jlog(any: any)
{
  console.log(JSON.stringify(any, null,2));
}

export { isTypedObject, isDefined, generateUniqueId, colog, jlog };
