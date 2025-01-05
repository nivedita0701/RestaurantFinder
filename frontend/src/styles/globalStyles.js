// src/styles/globalStyles.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#d32323', // Yelp red
        },
        secondary: {
            main: '#ffffff', // White for secondary buttons
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

export default theme;
