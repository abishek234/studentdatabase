import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Button, 
  Popover, 
  Box, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  Divider,
  Stack
} from '@mui/material';
import Iconify from '../../../../components/Iconify';

export default function StudentColumnFilter({ columns, visibleColumns, onToggleColumn, onResetColumns }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'column-filter-popover' : undefined;

  return (
    <>
      <Button
        color="primary"
        aria-describedby={id}
        onClick={handleClick}
        startIcon={<Iconify icon="mdi:table-column" />}
        sx={{ ml: 1 }}
      >
        Columns
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 250, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Table Columns
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {columns.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={visibleColumns.includes(column.id)}
                  onChange={() => onToggleColumn(column.id)}
                  // Don't allow unchecking if it's the 'view' or 'action' column
                  disabled={column.id === 'view' || column.id === 'action'}
                />
              }
              label={column.label}
              sx={{ display: 'block', mb: 1 }}
            />
          ))}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between">
            <Button 
              onClick={onResetColumns} 
              variant="outlined" 
              size="small"
            >
              Reset
            </Button>
            <Button 
              onClick={handleClose} 
              variant="contained" 
              size="small"
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

StudentColumnFilter.propTypes = {
  columns: PropTypes.array.isRequired,
  visibleColumns: PropTypes.array.isRequired,
  onToggleColumn: PropTypes.func.isRequired,
  onResetColumns: PropTypes.func.isRequired
};

// Removed duplicate export default