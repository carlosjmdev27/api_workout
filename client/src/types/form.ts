/** Error message per form field (only for fields that are invalid). */
export type FormErrors<T> = Partial<Record<keyof T, string>>;
