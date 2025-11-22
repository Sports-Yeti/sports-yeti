import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends Omit<TextFieldProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  ...textFieldProps
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          error={!!error}
          helperText={error?.message}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}

export default FormInput;
