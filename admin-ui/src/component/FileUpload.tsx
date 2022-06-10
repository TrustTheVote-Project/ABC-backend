import { useCallback, useState } from 'react';
import {useDropzone} from 'react-dropzone';

import Box from '@mui/material/Box';

import theme from 'theme';
import { Alert, Button, Snackbar, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import Loading from './Loading';

interface FileUploadParams {
  onLoadFile: (file: File)=>Promise<void>,
  multiple?: boolean
}

export default function FileUpload({
  onLoadFile,
  multiple
}: FileUploadParams) {  
  const [alertText, setAlertText] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);


  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(()=>setAlertText(""), 4000)
  }

  const processFile = (acceptedFile: File) => {
    const readerPromise = new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        //const dataUrl = reader.result
        onLoadFile(acceptedFile).then(()=>{
          resolve();
        })
      }
      reader.readAsDataURL(acceptedFile);
    })
    return readerPromise;
  }

  const onDrop = useCallback((acceptedFiles)=>{
    const processAcceptedFiles = async () => {
      setProcessing(true);
      const promises: Array<Promise<void>> = [];
      acceptedFiles.forEach((file: any)=>{
        promises.push(processFile(file));
      })
      await Promise.all(promises);
      setProcessing(false);
      //setAlert(`${multiple ? acceptedFiles.length + ' ' : ''}File${multiple ? 's' : ''} uploaded`)
    }
    processAcceptedFiles();
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    multiple: !!multiple,
  })

  const boxStyles: SxProps<Theme> = {
    fontSize: '1.5rem',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: theme.palette.background.paper,
    padding: '2rem'
  }

  const box = processing ? <Box sx={boxStyles}>Uploading Files</Box> : <Box {...getRootProps()} sx={boxStyles}>
    <input {...getInputProps()} />
    Drag and drop a .zip file{multiple ? 's' : ''} here<br/><br/>
    <Button>Select</Button>
  </Box>

  return <>
    {box}
    {alertText && <Alert severity="success">{alertText}</Alert>}
  </>
}