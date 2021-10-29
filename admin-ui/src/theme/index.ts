import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

//import { default as palette, colors } from './palette';

const baseTheme = createTheme({
  palette: {
    info: {
      light: grey[400],
      main: grey[500]
    }
  }
}) // createTheme({palette})


const theme = createTheme({
  palette: baseTheme.palette,
  typography: {
    h1: {
      fontSize: "32px",
      marginBottom: "0.5em",
      fontWeight: 600,
      color: baseTheme.palette.info.light
    },
    h2: {
      fontSize: "28px",
      marginBottom: "0.5em",
      fontWeight: 600,
      color: baseTheme.palette.text.secondary
    },
    h3: {
      fontSize: "20px",
      marginBottom: "0.5em",
      fontWeight: 600,
    }, 
    h4: {
      fontSize: "18px",      
      fontWeight: 600,
      marginBottom: "0.5em",
      
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      color: baseTheme.palette.text.secondary
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          fontFamily: "sans-serif",
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 20,
        }  
      }
    },  
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
      styleOverrides: {
        root: {
          position: "relative",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: baseTheme.palette.text.primary,
          padding: 0,
          marginBottom: "1em",
          transform: 'unset'
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true
      }
    },
    MuiInputBase: {
      defaultProps: {
        fullWidth: true
      },
      styleOverrides: {
        root: {
          fontSize: "1.5rem",
          background: baseTheme.palette.background.paper,
          padding: baseTheme.spacing(2),
          height: "auto"
        },
        input: {
          padding: 0,
          lineHeight: "1em"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined",        
      },
    },
    MuiButton: {
      defaultProps: {
        fullWidth: true,
        variant: "contained"
      }
    }
  }
});

export default theme;