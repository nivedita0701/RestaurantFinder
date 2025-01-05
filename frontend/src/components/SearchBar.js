import React from 'react';
import { TextField, Button } from '@mui/material';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  return (
    <div style={{ display: 'flex', margin: '20px 0' }}>
      <TextField
        variant="outlined"
        label="Search Restaurants"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        style={{ marginRight: '10px' }}
      />
      <Button variant="contained" color="primary" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
