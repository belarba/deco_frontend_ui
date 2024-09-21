import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Button, TextField, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Tooltip
} from '@mui/material';
import { styled } from '@mui/system';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Ajuste conforme necessário

const Input = styled('input')({
  display: 'none',
});

const ProductProcessingApp = () => {
  const [jobId, setJobId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const checkProcessingStatus = async () => {
    if (!jobId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/processing_status/${jobId}`);
      setProcessingStatus(response.data.status);
      if (response.data.status === 'completed') {
        fetchProducts();
      }
    } catch (err) {
      setError('Erro ao verificar o status do processamento');
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { page, product_name: searchTerm }
      });
      setProducts(response.data.products);
      setCurrentPage(page);
    } catch (err) {
      setError('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  useEffect(() => {
    if (jobId && processingStatus !== 'completed') {
      const interval = setInterval(checkProcessingStatus, 5000); // Verifica a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [jobId, processingStatus]);

  useEffect(() => {
    fetchProducts();
  }, []);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
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

      {jobId && processingStatus !== 'completed' && (
        <Alert severity="info">Status do processamento: {processingStatus || 'Verificando...'}</Alert>
      )}

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