import React, { useEffect } from 'react';
import { Button, Typography, Paper, Box } from '@mui/material';
import { styled } from '@mui/system';

const Input = styled('input')({
  display: 'none',
});

const FileUploader = ({ onFileChange, onStartProcessing, selectedFile, loading, importCompleted, clearSelectedFile }) => {
  useEffect(() => {
    if (importCompleted) {
      clearSelectedFile();
    }
  }, [importCompleted, clearSelectedFile]);

  return (
    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
      <Box display="flex" alignItems="center" flexWrap="wrap">
        <Box marginRight={2} marginBottom={1}>
          <label htmlFor="contained-button-file">
            <Input
              accept="application/json"
              id="contained-button-file"
              type="file"
              onChange={onFileChange}
            />
            <Button variant="contained" component="span">
              Selecionar Arquivo
            </Button>
          </label>
        </Box>
        <Box marginBottom={1}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onStartProcessing} 
            disabled={loading || !selectedFile}
          >
            Importar Novo Arquivo
          </Button>
        </Box>
      </Box>
      {selectedFile && (
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          Arquivo selecionado: {selectedFile.name}
        </Typography>
      )}
    </Paper>
  );
};

export default FileUploader;