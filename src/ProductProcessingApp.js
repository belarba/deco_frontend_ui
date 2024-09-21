import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Ajuste conforme necessário

const ProductProcessingApp = () => {
  const [jobId, setJobId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Processamento de Produtos</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="mb-2"
        />
        <button 
          onClick={startProcessing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          disabled={loading || !selectedFile}
        >
          Importar Novo Arquivo
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex">
        <input
          type="text"
          placeholder="Buscar por nome do produto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-l flex-grow"
        />
        <button 
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
          disabled={loading}
        >
          Buscar
        </button>
      </form>

      {jobId && processingStatus !== 'completed' && (
        <p>Status do processamento: {processingStatus || 'Verificando...'}</p>
      )}

      {products.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Lista de Produtos</h2>
          {products.map(product => (
            <div key={product.id} className="border p-4 mb-4 rounded shadow">
              <h3 className="font-bold text-lg">{product.product_name}</h3>
              <p><strong>ID:</strong> {product.id}</p>
              <p><strong>País:</strong> {product.country}</p>
              <p><strong>Marca:</strong> {product.brand}</p>
              <p><strong>ID do Produto:</strong> {product.product_id}</p>
              <p><strong>Loja:</strong> {product.shop_name}</p>
              <p><strong>Categoria ID:</strong> {product.product_category_id}</p>
              <p><strong>Preço:</strong> €{product.price.toFixed(2)}</p>
              <p><strong>URL:</strong> <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{product.url}</a></p>
              <p><strong>Criado em:</strong> {new Date(product.created_at).toLocaleString()}</p>
              <p><strong>Atualizado em:</strong> {new Date(product.updated_at).toLocaleString()}</p>
              <p><strong>Número da Linha:</strong> {product.row_num}</p>
            </div>
          ))}
          <div className="mt-4">
            <button 
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
            >
              Anterior
            </button>
            <button 
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={loading}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Próxima
            </button>
          </div>
        </div>
      ) : (
        <p>Nenhum produto encontrado.</p>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProductProcessingApp;