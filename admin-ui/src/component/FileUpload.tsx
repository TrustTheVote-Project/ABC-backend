import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import Box from "@mui/material/Box";

import theme from "theme";
import { Alert, Button, Snackbar, Theme } from "@mui/material";
import { SxProps } from "@mui/system";
import Loading from "./Loading";

interface FileUploadParams {
  onLoadFile: (file: File) => Promise<void>;
  multiple?: boolean;
  instructions?: string;
  disabled?: boolean;
  disabledMessage?: string;
  trackState?: any;
}

export default function FileUpload({
  onLoadFile,
  multiple,
  disabled = false,
  disabledMessage = "File upload disabled",
  instructions = "Drag and drop a file here, or click to select a file",
  trackState = {},
}: FileUploadParams) {
  const [alertText, setAlertText] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  const setAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(""), 4000);
  };

  const processFile = (acceptedFile: File) => {
    const readerPromise = new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        //const dataUrl = reader.result
        onLoadFile(acceptedFile)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            setAlert("Error processing file");
            setProcessing(false);
            throw e;
          });
      };
      reader.readAsDataURL(acceptedFile);
    });

    return readerPromise;
  };

  const onDrop = useCallback((acceptedFiles) => {
    const processAcceptedFiles = async () => {
      try {
        setProcessing(true);
        const promises: Array<Promise<void>> = [];
        acceptedFiles.forEach((file: any) => {
          promises.push(processFile(file));
        });

        await Promise.all(promises);
        setProcessing(false);
      } catch (e) {
        setProcessing(false);
        setAlert("Error uploading file");
      }

      //setAlert(`${multiple ? acceptedFiles.length + ' ' : ''}File${multiple ? 's' : ''} uploaded`)
    };
    try {
      processAcceptedFiles();
      setProcessing(false);
    } catch (e) {
      setProcessing(false);
      setAlert("Error processing uploaded file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: !!multiple,
  });

  const boxStyles: SxProps<Theme> = {
    fontSize: "1.5rem",
    textAlign: "center",
    color: theme.palette.text.secondary,
    background: theme.palette.background.paper,
    padding: "2rem",
  };

  const box = processing ? (
    <Box sx={boxStyles}>Uploading Files</Box>
  ) : (
    <Box {...getRootProps()} sx={boxStyles}>
      {disabled ? (
        <div>{disabledMessage}</div>
      ) : (
        <>
          <input {...getInputProps()} />
          {instructions}
          <br />
          <br />
          <Button>Select</Button>
        </>
      )}
    </Box>
  );

  return (
    <>
      {box}
      {alertText && <Alert severity="success">{alertText}</Alert>}
    </>
  );
}
