import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Tooltip } from '@mui/material';

const ProductTable = ({ products }) => {
  if (products.length === 0) {
    return <Typography variant="body1">Nenhum produto encontrado.</Typography>;
  }

  return (
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
  );
};

export default ProductTable;