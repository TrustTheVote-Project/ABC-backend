import { FormControl } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';

interface InputProps {
  name: string
  label: string
  placeholder: string
}

export default function Input({
  name,
  label,
  placeholder
}: InputProps ) {
  return <FormControl variant="outlined">
    <InputLabel shrink htmlFor={name}>{label}</InputLabel>
    <InputBase id={name} placeholder={placeholder} />
  </FormControl>
}