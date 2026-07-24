import type { Environment } from "../../core/Environment";
import { BinaryField, type Field, Many2manyField, Many2oneField, One2manyField, SelectionField } from "../../core/fields";
import type { ModelValues } from "../../core/types";
import { BinaryFormField } from "./BinaryFormField";
import { BooleanFieldInput } from "./BooleanFieldInput";
import { Many2manyFieldInput } from "./Many2manyFieldInput";
import { Many2oneFieldInput } from "./Many2oneFieldInput";
import { One2manyFieldInput } from "./One2manyFieldInput";
import { TextFieldInput } from "./TextFieldInput";
import { SelectionFieldInput } from "./SelectionFieldInput";

export function FormFieldRenderer({ env, modelName, recordId, name, field, value, relations, onChange }: { env: Environment; modelName: string; recordId?: string; name: string; field: Field; value: unknown; relations: ModelValues[]; onChange: (value: unknown) => void }) {
  if (field.kind === "boolean") return <BooleanFieldInput name={name} field={field} value={value} onChange={onChange} />;
  if (field instanceof BinaryField) return <BinaryFormField env={env} name={name} field={field} value={value} modelName={modelName} recordId={recordId} onChange={onChange} />;
  if (field instanceof Many2oneField) return <Many2oneFieldInput env={env} name={name} field={field} value={value} relations={relations} onChange={onChange} />;
  if (field instanceof Many2manyField) return <Many2manyFieldInput env={env} name={name} field={field} value={value} relations={relations} onChange={onChange} />;
  if (field instanceof One2manyField) return <One2manyFieldInput env={env} name={name} field={field} parentId={recordId} />;
  if (field instanceof SelectionField) return <SelectionFieldInput name={name} field={field} value={value} onChange={onChange} />;
  return <TextFieldInput name={name} field={field} value={value} onChange={onChange} />;
}
