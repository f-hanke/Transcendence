type ObjAllPropsBoolean<T> = {
  [K in keyof T]: boolean;
};

export type {
  ObjAllPropsBoolean
}