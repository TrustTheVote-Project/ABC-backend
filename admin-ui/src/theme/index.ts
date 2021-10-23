import { createTheme } from '@mui/material/styles';

//import { default as palette, colors } from './palette';

const baseTheme = createTheme() // createTheme({palette})


const theme = createTheme({
  //palette,
  typography: {
    h1: {
      fontSize: "32px",
      marginBottom: "0.5em",
      fontWeight: 600
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
    MuiTextField: {
      defaultProps: {
        fullWidth: true
      }
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