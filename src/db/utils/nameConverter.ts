export function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace(/[-_]/, ""));
}

export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function toCamelCaseObject<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCaseObject(item)) as T;
  }

  if (obj instanceof Date) {
    return obj as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = toCamelCaseObject(obj[key]);
    }
  }
  return result as T;
}

export function toSnakeCaseObject<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCaseObject(item)) as T;
  }

  if (obj instanceof Date) {
    return obj as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = toSnakeCaseObject(obj[key]);
    }
  }
  return result as T;
}
