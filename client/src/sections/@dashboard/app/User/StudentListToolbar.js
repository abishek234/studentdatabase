import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Card, Box, TextField, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@emotion/react';
import axios from 'axios';
import { useState } from 'react';
import Iconify from '../../../../components/Iconify';
import FilterForm from './FilterForm'; // Import the FilterForm component

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  padding: theme.spacing(1, 2),
  gap: theme.spacing(2),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

const DropdownCard = styled(Card)(({ theme, isMobile }) => ({
  position: 'absolute',
  top: '100%',
  left: isMobile ? 0 : '575px',
  zIndex: 10,
  padding: theme.spacing(2),
  width: isMobile ? '100vw' : '90vw',
  maxWidth: isMobile ? '450px' : '350px',
  maxHeight: '400px',
  overflowY: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  minHeight: '50px',
}));

const EmailPopup = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
  padding: theme.spacing(3),
  width: '90vw',
  maxWidth: 400,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    width: '95vw',
  },
}));


StudentListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onResetFilters: PropTypes.func,
  selectedEmails: PropTypes.array, // Added selectedEmails prop
};

export default function StudentListToolbar({ numSelected, filterName, onFilterName, filters, onFilterChange, onResetFilters, selectedEmails }) {
  const [showFilter, setShowFilter] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    onFilterChange(updatedFilters);
  };

  const handleSendEmail = async () => {
    try {
    const response = await axios.post('http://localhost:7070/api/students/send-bulk-email', { emails: selectedEmails, text: message });
      alert('Emails sent successfully');
      setShowEmailPopup(false);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error sending emails');
    }
  };

  return (
    <RootStyle sx={{ ...(numSelected > 0 && { color: 'primary.main', bgcolor: 'primary.lighter' }) }}>
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <SearchStyle
            value={filterName}
            onChange={onFilterName}
            placeholder="Search user..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
          />

          <Tooltip title="Filter list">
            <IconButton onClick={() => setShowFilter((prev) => !prev)}>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>

          {showFilter && (
            <DropdownCard isMobile={isMobile}>
              <FilterForm filters={filters} onFilterChange={handleFilterChange} onResetFilters={onResetFilters} />
            </DropdownCard>
          )}
        </>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Send Email">
          <IconButton onClick={() => setShowEmailPopup(true)}>
            <Iconify icon="eva:email-fill" />
          </IconButton>
        </Tooltip>
      ) : null}

      {showEmailPopup && (
        <EmailPopup>
          <Typography variant="h6">Send Message</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ marginTop: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="outlined" onClick={() => setShowEmailPopup(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSendEmail}>
              Send
            </Button>
          </Box>
        </EmailPopup>
      )}
    </RootStyle>
  );
}
