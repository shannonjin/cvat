export interface Attribute{
  id: number;
  name: string;
  mutable: boolean;
  input_type: "checkbox"| "radio"| "number"| "text"| "select"
  default_value: string | number | boolean ; //see cvat source code
  values: string[] | number[] | boolean[] ; //see cvat source code
}
