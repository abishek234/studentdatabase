import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 'auto', // Adjust to allow content to expand
  display: 'flex',
  flexDirection: 'column', // Stack the content vertically
  padding: theme.spacing(0, 1, 0, 3),
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

// ----------------------------------------------------------------------

FilterForm.propTypes = {
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onResetFilters: PropTypes.func, // Add the onResetFilters prop
};

export default function FilterForm({ filters, onFilterChange, onResetFilters }) {
  const handleInputChange = (field) => (event) => {
    onFilterChange(field, event.target.value);
  };

  const handleResetFilters = () => {
    onResetFilters(); // Call the onResetFilters function to reset filters
  };

  return (
    <RootStyle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Name filter */}
        <SearchStyle
          value={filters.name}
          onChange={handleInputChange('name')}
          placeholder="Search by Name"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />

        {/* Gender filter */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={filters.gender}
            onChange={handleInputChange('gender')}
            label="Gender"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {/* Minority Status filter */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Minority Status</InputLabel>
          <Select
            value={filters.minorityStatus}
            onChange={handleInputChange('minorityStatus')}
            label="Minority Status"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Minority">Minority</MenuItem>
            <MenuItem value="Non-Minority">Non-Minority</MenuItem>
          </Select>
        </FormControl>

        {/* Residential Status filter */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Residential Status</InputLabel>
          <Select
            value={filters.residentialStatus}
            onChange={handleInputChange('residentialStatus')}
            label="Residential Status"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Hosteller">Hosteller</MenuItem>
            <MenuItem value="Day Scholar">Day Scholar</MenuItem>
          </Select>
        </FormControl>

        {/* Community filter */}
        <TextField
          fullWidth
          label="Community"
          value={filters.community}
          onChange={handleInputChange('community')}
          margin="normal"
        />

        {/* Religion filter */}
        <TextField
          fullWidth
          label="Religion"
          value={filters.religion}
          onChange={handleInputChange('religion')}
          margin="normal"
        />

        {/* Admission Quota filter */}
        <TextField
          fullWidth
          label="Admission Quota"
          value={filters.admissionQuota}
          onChange={handleInputChange('admissionQuota')}
          margin="normal"
        />
        

        {/* Country filter */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={filters.country}
            onChange={handleInputChange('country')}
            label="Country"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Domestic">Domestic</MenuItem>
            <MenuItem value="International">International</MenuItem>
          </Select>
        </FormControl>

        {/* Course filter */}
        <TextField
          fullWidth
          label="Course"
          value={filters.course}
          onChange={handleInputChange('course')}
          margin="normal"
        />

        {/* Department filter */}
        <TextField
          fullWidth
          label="Department"
          value={filters.department}
          onChange={handleInputChange('department')}
          margin="normal"
        />

        {/* Year of Admission filter */}
        <TextField
          fullWidth
          label="Year of Admission"
          value={filters.yearOfAdmission}
          onChange={handleInputChange('yearOfAdmission')}
          margin="normal"
        />

        {/* Reset button */}
        <Button variant="outlined" onClick={handleResetFilters} sx={{ mt: 2 }}>
          Reset Filters
        </Button>
      </Box>
    </RootStyle>
  );
}
