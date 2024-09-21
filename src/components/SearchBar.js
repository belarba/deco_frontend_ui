import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Paper } from '@mui/material';

const SearchBar = ({ searchTerm, selectedCountry, countries, onSearchTermChange, onCountryChange, onSearch, loading }) => {
  return (
    <Paper component="form" onSubmit={onSearch} style={{ padding: '20px', marginBottom: '20px', display: 'flex' }}>
      <TextField
        variant="outlined"
        placeholder="Buscar por nome do produto"
        value={searchTerm}
        onChange={onSearchTermChange}
        fullWidth
      />
      <FormControl variant="outlined" style={{ minWidth: 120, marginLeft: '10px' }}>
        <InputLabel id="country-select-label">País</InputLabel>
        <Select
          labelId="country-select-label"
          id="country-select"
          value={selectedCountry}
          onChange={onCountryChange}
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
  );
};

export default SearchBar;