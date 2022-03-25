import MUIDatePicker from '@mui/lab/DatePicker';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import { Maybe } from 'types';
import Input, { InputProps } from './Input';

interface DatePickerProps {
  name: string
  label: string
  placeholder?: string
  data?: Maybe<{[x: string]: any}>
  onChange?: (name: string, value: Date | null) => void  
}

export default function DatePicker({
  name,
  label,
  placeholder,
  onChange,
  data,
  ...props
}: DatePickerProps ) {
  const value = data && data[name] || "a";

  //console.log(data, name);
  
  return <MUIDatePicker 
    label={label}     
    onChange={(date: Date | null)=>{
      console.log('hi')
      onChange && onChange(name, date);
    }}
    value={value}
    clearable
    //error={false}
    renderInput={(params: any) => {
      const inputParams = {
        ...params,
        ...props
      } as InputProps
      return <Input {...inputParams} />
    }}
  />
}



