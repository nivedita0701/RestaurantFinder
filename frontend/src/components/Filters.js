import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Filters = ({ category, setCategory, priceRange, setPriceRange, rating, setRating, zipcode, setZipcode }) => {

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="vegan">Vegan</MenuItem>
          <MenuItem value="italian">Italian</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Price Range</InputLabel>
        <Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Rating</InputLabel>
        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {[5, 4, 3, 2, 1].map((rate) => (
            <MenuItem key={rate} value={rate}>
              {`${rate} Star${rate > 1 ? 's' : ''}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Zipcode"
        variant="outlined"
        fullWidth
        value={zipcode}
        onChange={(e) => setZipcode(e.target.value)}
      />
    </div>
  );
};

export default Filters;
