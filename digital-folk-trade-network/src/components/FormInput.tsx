import { type UseFormRegister, type FieldValues, type Path } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  register: UseFormRegister<T>;
  error?: string | undefined;
}

export default function FormInput<T extends FieldValues>({
  label,
  name,
  type = "text",
  register,
  error,
}: FormInputProps<T>) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        aria-invalid={!!error}
        className={`w-full border p-2 rounded ${error ? "border-red-500" : "border-slate-200"}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}