import { FormControl, FormHelperText } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import { useState } from 'react';
import { Maybe } from 'types';

export interface InputProps {
  name: string
  required?: string
  label?: string
  placeholder?: string
  multiline?: boolean
  minRows?: number
  data?: Maybe<{[x: string]: any}>
  readOnly?: boolean;
  onChange?: (name: string, value: string) => void  
}

export default function Input({
  name,
  required,
  label,
  placeholder,
  onChange,
  multiline,
  minRows,
  data,
  readOnly,
  ...props
}: InputProps ) {
  const [visited, setVisited] = useState<boolean>(false)
  const value = data && data[name];
  //console.log(data, name);
  let error = false;
  let helpText ="";
  if (required && !value && visited) {
    error = true;
    helpText = required
  }

  return <FormControl variant="outlined">
    {label && <InputLabel error={error} shrink htmlFor={name}>{label}</InputLabel>}
    <InputBase multiline={multiline} value={value} onChange={(event)=>{
      onChange && onChange(name, event.target.value);
    }} onBlur={()=>{setVisited(true)}} id={name} placeholder={placeholder} minRows={minRows} readOnly={readOnly} {...props} />
    {helpText && <FormHelperText error={error}>{helpText}</FormHelperText>}
  </FormControl>
}