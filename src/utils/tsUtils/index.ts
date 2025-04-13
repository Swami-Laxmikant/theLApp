export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TimeOut = ReturnType<typeof setTimeout>;

export type WithUndefined<T extends object> = {
  [k in keyof T]: T[k] | undefined;
}
