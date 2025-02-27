import { filter, set } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';  
import axios from 'axios';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/app/User';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
 
  { id: 'email', label: 'Email', alignRight: false }, 
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'action', label: 'Action', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query, roleFilter) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredArray = stabilizedThis.map((el) => el[0]);

  // Apply text query filter
  if (query) {
    filteredArray = filteredArray.filter((user) =>
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Apply role filter
  if (roleFilter) {
    filteredArray = filteredArray.filter((user) =>
      user.role.toLowerCase() === roleFilter.toLowerCase()
    );
  }

  return filteredArray;
}

export default function User() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('email'); // Default sort by email
  const [filterName, setFilterName] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // State for role filter
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for users
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [name,setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [role, setRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);




  // Fetch users from the server on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the server
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:7070/api/auth/users'); // Ensure this matches your backend endpoint
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.email); // Use email as unique identifier
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, email) => {
    const selectedIndex = selected.indexOf(email);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, email);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  // Handle opening and closing of modal for editing user
  const handleOpenModal = (userId) => {
    if (userId) {

      const userToEdit = users.find(user => user._id === userId);
      if (userToEdit) {
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        setEditingUserId(userId);
      }
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
    setOpenModal(true);

  };


  const handleCloseModal = () => {
    setOpenModal(false);
    setName('');
    setEmail('');
    setPassword('');

    setEditingUserId(null);

  };



  // Handle adding a new user
  const handleAddUser = async () => {
    try {

      const response = await axios.post('http://localhost:7070/api/auth/register', { name,email, password, role: 'staff' }); // Adjust based on your actual data structure
      toast.success('User added successfully');
      fetchUsers(); // Refresh user list after adding
      handleCloseModal(); // Close modal after adding
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Handle updating a user
  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(`http://localhost:7070/api/auth/update-user/${editingUserId}`, { name,email}); // Adjust endpoint as necessary
      toast.success(response.data.message);
      fetchUsers(); // Refresh user list after updating
      handleCloseModal(); // Close modal after updating
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(`http://localhost:7070/api/auth/delete-user/${userId}`); // Adjust endpoint as necessary
        toast.success(response.data.message);
        fetchUsers(); // Refresh user list after deletion
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleViewUser = (user) => {
    // Open a modal or set state to display user details
    setSelectedUser(user); // Assuming you have state to hold selected user data
    setViewModalOpen(true); // Open the modal for viewing user details
  };




  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  // Apply sorting and filtering
  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName, roleFilter);


  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            roleFilter={roleFilter}
            onRoleFilterChange={(e) => setRoleFilter(e.target.value)}
          />


          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, name,email, role } = row; // Adjust based on your actual data structure
                    const isItemSelected = selected.indexOf(email) !== -1;

                    return (
                      <TableRow
                        hover
                        key={_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
<TableCell align="left">
  <IconButton onClick={() => handleViewUser(row)} aria-label="view user">
    <Iconify icon="eva:eye-fill" />
  </IconButton>
</TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={email} src="/path/to/default/avatar.png" /> {/* Use a default avatar or user's avatar */}
                            <Typography variant="subtitle2" noWrap>
                              {email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{name}</TableCell>
                        <TableCell align="left">{role}</TableCell>

                        <TableCell align="left">
                          <UserMoreMenu
                            onEdit={() => handleOpenModal(row._id)}
                            onDelete={() => handleDeleteUser(row._id)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Modal for Editing User */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{editingUserId ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogContent>
            {/* Name Field */}
            <TextField
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
            />
            {/* Email Field */}
            <TextField
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />


            {/* Password Field only when adding a new user */}
            {!editingUserId && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            {editingUserId ? (
              <Button onClick={handleUpdateUser}>Update User</Button>
            ) : (
              <Button onClick={handleAddUser}>Add User</Button>
            )}
          </DialogActions>
        </Dialog>


        <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={selectedUser?.name}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField 
              label="Email"
              value={selectedUser?.email}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Role"
              value={selectedUser?.role}
              fullWidth
              margin="normal"
              disabled
            />
            {/* Add more fields as necessary */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>


      </Container>
    </Page>
  );
}
