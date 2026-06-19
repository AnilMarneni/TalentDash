/* eslint-disable @typescript-eslint/no-explicit-any */
export function serializeBigInt<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  if (typeof obj === "object") {
    if (obj instanceof Date) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInt);
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializeBigInt((obj as any)[key]);
      }
    }
    return newObj;
  }

  return obj;
}
