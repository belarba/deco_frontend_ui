import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import FileUploader from './components/FileUploader';
import SearchBar from './components/SearchBar';
import ProcessingModal from './components/ProcessingModal';
import ProductTable from './components/ProductTable';
import Pagination from './components/Pagination';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const [importCompleted, setImportCompleted] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/json") {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError("Por favor, selecione um arquivo JSON válido.");
      }
    } else {
      setSelectedFile(null);
      setError(null);
    }
    setImportCompleted(false);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
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
    setImportCompleted(false);
    
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

  const fetchProducts = useCallback(async (page = 1, newSearchTerm = searchTerm, newCountry = selectedCountry) => {
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
  }, [searchTerm, selectedCountry]);

  const checkProcessingStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/processing_status/${jobId}`);
      setProcessingStatus(response.data.status);
      setProcessingProgress(response.data.progress || 0);
      
      if (response.data.status === 'completed') {
        setIsModalOpen(false);
        setImportCompleted(true);
        fetchProducts();
      } else if (response.data.status === 'failed') {
        setError('O processamento falhou. Por favor, tente novamente.');
        setIsModalOpen(false);
      }
    } catch (err) {
      setError('Erro ao verificar o status do processamento');
      setIsModalOpen(false);
    }
  }, [jobId, fetchProducts]);

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
  }, [fetchProducts]);

  useEffect(() => {
    let intervalId;
    if (jobId && isModalOpen) {
      intervalId = setInterval(checkProcessingStatus, 2000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isModalOpen, checkProcessingStatus]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Processamento de Produtos
      </Typography>
      
      <FileUploader
        onFileChange={handleFileChange}
        onStartProcessing={startProcessing}
        selectedFile={selectedFile}
        loading={loading}
        importCompleted={importCompleted}
        clearSelectedFile={clearSelectedFile}
      />

      <SearchBar
        searchTerm={searchTerm}
        selectedCountry={selectedCountry}
        countries={countries}
        onSearchTermChange={handleSearchTermChange}
        onCountryChange={handleCountryChange}
        onSearch={handleSearch}
        loading={loading}
      />

      <ProcessingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={processingStatus}
        progress={processingProgress}
      />

      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      <ProductTable products={products} />

      <Pagination
        currentPage={currentPage}
        onPrevious={() => fetchProducts(currentPage - 1)}
        onNext={() => fetchProducts(currentPage + 1)}
        loading={loading}
      />
    </Container>
  );
};

export default ProductProcessingApp;