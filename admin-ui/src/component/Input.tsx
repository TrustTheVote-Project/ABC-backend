import { FormControl } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';

interface InputProps {
  name: string
  label: string
  placeholder?: string
  multiline?: boolean
  minRows?: number
  data?: Mayb<{[x: string]: any}>
  onChange?: (name: string, value: string) => void  
}

export default function Input({
  name,
  label,
  placeholder,
  onChange,
  multiline,
  minRows,
  data
}: InputProps ) {
  const value = data && data[name];
  console.log(data, name);
  return <FormControl variant="outlined">
    <InputLabel shrink htmlFor={name}>{label}</InputLabel>
    <InputBase multiline={multiline} value={value} onChange={(event)=>{
      onChange && onChange(name, event.target.value);
    }} id={name} placeholder={placeholder} minRows={minRows} />
  </FormControl>
}