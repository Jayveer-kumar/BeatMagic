import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function EmailSenderLoader() {
  return (
    <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
        }}>
      <CircularProgress size={28} sx={{color:"#f9f9f9ff"}} />
    </Box>
  );
}
