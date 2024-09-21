import React from 'react';
import { Modal, Box, Typography, LinearProgress } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ProcessingModal = ({ open, onClose, status, progress }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Status de Importação
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {status || 'Iniciando...'}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 2 }}
        />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {`${Math.round(progress)}%`}
        </Typography>
      </Box>
    </Modal>
  );
};

export default ProcessingModal;