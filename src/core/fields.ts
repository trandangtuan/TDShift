export type FieldKind =
  | "integer"
  | "float"
  | "char"
  | "text"
  | "boolean"
  | "date"
  | "datetime"
  | "binary"
  | "selection"
  | "many2one"
  | "one2many"
  | "many2many";

export interface FieldOptions<T> {
  string?: string;
  required?: boolean;
  readonly?: boolean;
  default?: T | (() => T);
  index?: boolean;
  help?: string;
}

export abstract class Field<T = unknown> {
  abstract readonly kind: FieldKind;
  readonly string: string;
  readonly required: boolean;
  readonly readonly: boolean;
  readonly defaultValue?: T | (() => T);
  readonly index: boolean;
  readonly help?: string;

  constructor(options: FieldOptions<T> = {}) {
    this.string = options.string ?? "";
    this.required = options.required ?? false;
    this.readonly = options.readonly ?? false;
    this.defaultValue = options.default;
    this.index = options.index ?? false;
    this.help = options.help;
  }

  abstract sqlType(): string;

  getDefault(): T | undefined {
    return typeof this.defaultValue === "function"
      ? (this.defaultValue as () => T)()
      : this.defaultValue;
  }

  toDatabase(value: unknown): unknown {
    return value ?? null;
  }

  fromDatabase(value: unknown): unknown {
    return value;
  }
}

export class IntegerField extends Field<number> {
  readonly kind = "integer" as const;
  sqlType() { return "INTEGER"; }
}

export class FloatField extends Field<number> {
  readonly kind = "float" as const;
  sqlType() { return "REAL"; }
}

export class CharField extends Field<string> {
  readonly kind = "char" as const;
  readonly size?: number;
  constructor(options: FieldOptions<string> & { size?: number } = {}) {
    super(options);
    this.size = options.size;
  }
  sqlType() { return "TEXT"; }
}

export class TextField extends Field<string> {
  readonly kind = "text" as const;
  sqlType() { return "TEXT"; }
}

export class BooleanField extends Field<boolean> {
  readonly kind = "boolean" as const;
  sqlType() { return "INTEGER"; }
  override toDatabase(value: unknown) { return value == null ? null : Number(Boolean(value)); }
  override fromDatabase(value: unknown) { return Boolean(value); }
}

export class DateField extends Field<string> {
  readonly kind = "date" as const;
  sqlType() { return "TEXT"; }
}

export class DatetimeField extends Field<string> {
  readonly kind = "datetime" as const;
  sqlType() { return "TEXT"; }
}

export class BinaryField extends Field<string> {
  readonly kind = "binary" as const;
  readonly attachment: boolean;
  readonly acceptedTypes?: string[];
  readonly maxSize?: number;
  constructor(options: FieldOptions<string> & { attachment?: boolean; acceptedTypes?: string[]; maxSize?: number } = {}) {
    super(options);
    this.attachment = options.attachment ?? true;
    this.acceptedTypes = options.acceptedTypes;
    this.maxSize = options.maxSize;
  }
  sqlType() { return "TEXT"; }
}

export type SelectionOption = readonly [value: string, label: string];

export class SelectionField extends Field<string> {
  readonly kind = "selection" as const;
  readonly selection: readonly SelectionOption[];
  constructor(selection: readonly SelectionOption[], options: FieldOptions<string> = {}) {
    super(options);
    if (!selection.length) throw new Error("Selection field cần ít nhất một lựa chọn");
    this.selection = selection;
  }
  sqlType() { return "TEXT"; }
  override toDatabase(value: unknown) {
    if (value != null && value !== "" && !this.selection.some(([key]) => key === value)) {
      throw new Error(`Giá trị selection không hợp lệ: ${String(value)}`);
    }
    return value ?? null;
  }
}

interface RelationOptions extends FieldOptions<string> { comodelName: string }

export class Many2oneField extends Field<string> {
  readonly kind = "many2one" as const;
  readonly comodelName: string;
  constructor(options: RelationOptions) {
    super(options);
    this.comodelName = options.comodelName;
  }
  sqlType() { return "TEXT"; }
}

export class One2manyField extends Field<string[]> {
  readonly kind = "one2many" as const;
  readonly comodelName: string;
  readonly inverseName: string;
  constructor(options: FieldOptions<string[]> & { comodelName: string; inverseName: string }) {
    super(options);
    this.comodelName = options.comodelName;
    this.inverseName = options.inverseName;
  }
  sqlType() { return ""; }
}

export class Many2manyField extends Field<string[]> {
  readonly kind = "many2many" as const;
  readonly comodelName: string;
  readonly relation?: string;
  constructor(options: FieldOptions<string[]> & { comodelName: string; relation?: string }) {
    super(options);
    this.comodelName = options.comodelName;
    this.relation = options.relation;
  }
  sqlType() { return ""; }
}

export const fields = {
  Integer: (options?: FieldOptions<number>) => new IntegerField(options),
  Float: (options?: FieldOptions<number>) => new FloatField(options),
  Char: (options?: FieldOptions<string> & { size?: number }) => new CharField(options),
  Text: (options?: FieldOptions<string>) => new TextField(options),
  Boolean: (options?: FieldOptions<boolean>) => new BooleanField(options),
  Date: (options?: FieldOptions<string>) => new DateField(options),
  Datetime: (options?: FieldOptions<string>) => new DatetimeField(options),
  Binary: (options?: FieldOptions<string> & { attachment?: boolean; acceptedTypes?: string[]; maxSize?: number }) => new BinaryField(options),
  Selection: (selection: readonly SelectionOption[], options?: FieldOptions<string>) => new SelectionField(selection, options),
  Many2one: (comodelName: string, options: Omit<RelationOptions, "comodelName"> = {}) =>
    new Many2oneField({ ...options, comodelName }),
  One2many: (comodelName: string, inverseName: string, options: FieldOptions<string[]> = {}) =>
    new One2manyField({ ...options, comodelName, inverseName }),
  Many2many: (comodelName: string, options: FieldOptions<string[]> & { relation?: string } = {}) =>
    new Many2manyField({ ...options, comodelName }),
};

export type FieldMap = Record<string, Field>;
