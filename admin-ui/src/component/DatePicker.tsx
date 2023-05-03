import { Maybe } from 'types';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

interface DatePickerProps {
  name: string
  label: string
  placeholder?: string
  data?: Maybe<{[x: string]: any}>
  readOnly?: boolean,
  onChange?: (name: string, value: Date | null) => void  
  [key: string]: any;
}

export default function DatePicker({
  name,
  label,
  placeholder,
  onChange,
  data,
  readOnly = false,
  ...props
}: DatePickerProps ) {
  
  const value = data && data[name] && new Date(data[name]) || null;
  const [open, setOpen] = useState(false);

  return <MUIDatePicker
    label={label}
    open={open}
    value={value}
    onChange={(newValue) => onChange && onChange(name, newValue)}
    onClose={() => setOpen(false)}
    onOpen={() => setOpen(true)}
    slotProps={{ 
      textField: { 
        size: 'small',
        helperText: props.helperText, 
        error: props.error,
        inputProps: {
          onClick: () => setOpen(true)
        }
        
      },
      actionBar: {
        actions: ['clear'],
      }
    }}
    disablePast
    readOnly={readOnly}
  />
  
}



