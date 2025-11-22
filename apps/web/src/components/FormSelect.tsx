import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: { value: string | number; label: string }[];
}

function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  ...selectProps
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth margin="normal" error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} {...selectProps} label={label}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export default FormSelect;
