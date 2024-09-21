import React from 'react';
import { Button } from '@mui/material';

const Pagination = ({ currentPage, onPrevious, onNext, loading }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <Button 
        onClick={onPrevious}
        disabled={currentPage === 1 || loading}
        variant="contained"
        style={{ marginRight: '10px' }}
      >
        Anterior
      </Button>
      <Button 
        onClick={onNext}
        disabled={loading}
        variant="contained"
      >
        Próxima
      </Button>
    </div>
  );
};

export default Pagination;