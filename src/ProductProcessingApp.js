import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Button, TextField, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Modal, Box, LinearProgress
} from '@mui/material';
import { styled } from '@mui/system';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Ajuste conforme necessário

const Input = styled('input')({
  display: 'none',
});

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

const ProductProcessingApp = () => {
  const [jobId, setJobId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError("Por favor, selecione um arquivo JSON válido.");
    }
  };

  const startProcessing = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo JSON antes de iniciar o processamento.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsModalOpen(true);
    setProcessingProgress(0);
    setProcessingStatus('Iniciando...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setJobId(response.data.job_id);
    } catch (err) {
      setError('Erro ao iniciar o processamento: ' + (err.response?.data?.message || err.message));
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const checkProcessingStatus = async () => {
    if (!jobId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/processing_status/${jobId}`);
      setProcessingStatus(response.data.status);
      setProcessingProgress(response.data.progress || 0);
      
      if (response.data.status === 'completed') {
        setIsModalOpen(false);
        fetchProducts();
      } else if (response.data.status === 'failed') {
        setError('O processamento falhou. Por favor, tente novamente.');
        setIsModalOpen(false);
      }
    } catch (err) {
      setError('Erro ao verificar o status do processamento');
      setIsModalOpen(false);
    }
  };

  const fetchProducts = async (page = 1, newSearchTerm = searchTerm, newCountry = selectedCountry) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { page, product_name: newSearchTerm, country: newCountry }
      });
      setProducts(response.data.products);
      setCountries(response.data.countries);
      setCurrentPage(page);
    } catch (err) {
      setError('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, searchTerm, selectedCountry);
  };

  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setSelectedCountry(newCountry);
    fetchProducts(1, searchTerm, newCountry);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let intervalId;
    if (jobId && isModalOpen) {
      intervalId = setInterval(checkProcessingStatus, 2000); // Check every 2 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isModalOpen]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Processamento de Produtos
      </Typography>
      
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <label htmlFor="contained-button-file">
          <Input accept="application/json" id="contained-button-file" type="file" onChange={handleFileChange} />
          <Button variant="contained" component="span">
            Selecionar Arquivo
          </Button>
        </label>
        {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={startProcessing} 
          disabled={loading || !selectedFile}
          style={{ marginLeft: '10px' }}
        >
          Importar Novo Arquivo
        </Button>
      </Paper>

      <Paper component="form" onSubmit={handleSearch} style={{ padding: '20px', marginBottom: '20px', display: 'flex' }}>
        <TextField
          variant="outlined"
          placeholder="Buscar por nome do produto"
          value={searchTerm}
          onChange={handleSearchTermChange}
          fullWidth
        />
        <FormControl variant="outlined" style={{ minWidth: 120, marginLeft: '10px' }}>
          <InputLabel id="country-select-label">País</InputLabel>
          <Select
            labelId="country-select-label"
            id="country-select"
            value={selectedCountry}
            onChange={handleCountryChange}
            label="País"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {countries.map((country) => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button 
          type="submit"
          variant="contained" 
          color="primary"
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          Buscar
        </Button>
      </Paper>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Status de Importação
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {processingStatus || 'Iniciando...'}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={processingProgress} 
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {`${Math.round(processingProgress)}%`}
          </Typography>
        </Box>
      </Modal>

      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {products.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Produto</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>País</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Loja</TableCell>
                <TableCell>URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.country}</TableCell>
                  <TableCell>€{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.shop_name}</TableCell>
                  <TableCell>
                    <Tooltip title={product.url} arrow>
                      <Typography noWrap style={{ maxWidth: 200 }}>
                        {product.url}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">Nenhum produto encontrado.</Typography>
      )}

      <div style={{ marginTop: '20px' }}>
        <Button 
          onClick={() => fetchProducts(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          variant="contained"
          style={{ marginRight: '10px' }}
        >
          Anterior
        </Button>
        <Button 
          onClick={() => fetchProducts(currentPage + 1)}
          disabled={loading}
          variant="contained"
        >
          Próxima
        </Button>
      </div>
    </Container>
  );
};

export default ProductProcessingApp;