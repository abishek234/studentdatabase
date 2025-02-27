import { filter, set } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
    Card,
    Table,
    Stack,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    TableContainer,
    TablePagination,
    useMediaQuery

} from '@mui/material';
import { useTheme } from '@emotion/react';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { StudentListHead, StudentListToolbar, StudentMoreMenu, StudentUserDialog, StudentAddUserDialog, StudentUserViewDialog } from '../sections/@dashboard/app/User';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'view', label: 'View', alignRight: false },
    { id: 'name', label: 'Name', alignRight: false },
    { id: 'email', label: 'Email', alignRight: false },
    { id: 'dob', label: 'Date Of Birth', alignRight: false },
    { id: 'gender', label: 'Gender', alignRight: false },
    { id: 'contact', label: 'Contact', alignRight: false },
    { id: 'address', label: 'Address', alignRight: false },
    { id: 'religion', label: 'Religion', alignRight: false },
    { id: 'community', label: 'Community', alignRight: false },
    { id: 'minorityStatus', label: 'Minority Status', alignRight: false },
    { id: 'residentialStatus', label: 'Residential Status', alignRight: false },
    { id: 'admissionQuota', label: 'Admission Quota', alignRight: false },
    { id: 'country', label: 'Country', alignRight: false },
    { id: 'course', label: 'Course', alignRight: false },
    { id: 'department', label: 'Department', alignRight: false },
    { id: 'yearOfAdmission', label: 'Year Of Admission', alignRight: false },
    { id: 'grades', label: 'Grades', alignRight: false },
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
function applySortFilter(array, comparator, query, filters) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    let filteredArray = stabilizedThis.map((el) => el[0]);

    // Apply text query filter across all fields
    if (query) {
        filteredArray = filteredArray.filter((user) =>
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase()) ||
            user.dob?.toString().toLowerCase().includes(query.toLowerCase()) ||
            user.gender?.toLowerCase().includes(query.toLowerCase()) ||
            user.contact?.toString().toLowerCase().includes(query.toLowerCase()) ||
            user.address?.toLowerCase().includes(query.toLowerCase()) ||
            user.religion?.toLowerCase().includes(query.toLowerCase()) ||
            user.community?.toLowerCase().includes(query.toLowerCase()) ||
            user.minorityStatus?.toLowerCase().includes(query.toLowerCase()) ||
            user.residentialStatus?.toLowerCase().includes(query.toLowerCase()) ||
            user.admissionQuota?.toLowerCase().includes(query.toLowerCase()) ||
            user.country?.toLowerCase().includes(query.toLowerCase()) ||
            user.course?.toLowerCase().includes(query.toLowerCase()) ||
            user.department?.toLowerCase().includes(query.toLowerCase()) ||
            user.yearOfAdmission?.toString().toLowerCase().includes(query.toLowerCase()) ||
            user.grades?.toString().toLowerCase().includes(query.toLowerCase())
        );
    }

    // Apply filters based on selected filters
    if (filters) {
        filteredArray = filteredArray.filter(student => {
            return (
                (!filters.name || student.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
                (!filters.gender || student.gender?.toLowerCase() === filters.gender.toLowerCase()) && // Gender filtering fix
                (!filters.minorityStatus || student.minorityStatus?.toLowerCase() === filters.minorityStatus.toLowerCase()) &&
                (!filters.residentialStatus || student.residentialStatus?.toLowerCase().includes(filters.residentialStatus.toLowerCase())) &&
                (!filters.community || student.community?.toLowerCase().includes(filters.community.toLowerCase())) &&
                (!filters.religion || student.religion?.toLowerCase().includes(filters.religion.toLowerCase())) &&
                (!filters.admissionQuota || student.admissionQuota?.toLowerCase().includes(filters.admissionQuota.toLowerCase())) &&
                (!filters.country || student.country?.toLowerCase().includes(filters.country.toLowerCase())) &&
                (!filters.course || student.course?.toLowerCase().includes(filters.course.toLowerCase())) &&
                (!filters.department || student.department?.toLowerCase().includes(filters.department.toLowerCase())) &&
                (!filters.yearOfAdmission || student.yearOfAdmission?.toString().toLowerCase().includes(filters.yearOfAdmission.toLowerCase()))
            );
        });
    }

    return filteredArray;
}



export default function Student() {
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('name'); // Default sort by email
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State for users
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [AddModalOpen, setAddModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        name: '',
        gender: '',
        minorityStatus: '',
        residentialStatus: '',
        community: '',
        religion: '',
        admissionQuota: '',
        country: '',
        course: '',
        department: '',
        yearOfAdmission: '',
    });
    




    // Fetch users from the server on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch users from the server
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:7070/api/students/students'); // Ensure this matches your backend endpoint
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
            // Select only filtered users if filtering is applied, otherwise select all users
            const newSelecteds = filteredUsers.length > 0 
                ? filteredUsers.map((user) => user.email) 
                : users.map((user) => user.email);
            
            setSelected(newSelecteds);
        } else {
            // Uncheck should clear all selected users
            setSelected([]);
        }
    };
    
    // Get the count of selected items that are currently visible in the filtered list
    const getVisibleSelectedCount = () => {
        return selected.filter((email) => 
            filteredUsers.some((user) => user.email === email)
        ).length;
    };
    
    // Get all emails of selected students
    const getSelectedEmails = () => {
        return selected;
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
          newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1)
          );
        }
        setSelected(newSelected);
      };


    // Handle changes in filters
    const handleFilterChange = (updatedFilters) => {
        setFilters(updatedFilters); // Update the filters in the parent state
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

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            name: '',
            gender: '',
            minorityStatus: '',
            residentialStatus: '',
            community: '',
            religion: '',
            admissionQuota: '',
            country: '',
            course: '',
            department: '',
            yearOfAdmission: '',
        });
    };

    // Handle deleting a user
    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const response = await axios.delete(`http://localhost:7070/api/students/students/${userId}`); // Adjust endpoint as necessary
                toast.success(response.data.message);
                fetchUsers(); // Refresh user list after deletion
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };



    const handleOpenModal = (userId) => {
        setOpenModal(true);
        setEditingUserId(userId);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingUserId(null);
    };

    const handleAddModal = () => {
        setAddModalOpen(true);
        setEditingUserId(null);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        setEditingUserId(null);
    };

    const handleViewStudent = (student) => {
        setSelectedUser(student);
        setViewModalOpen(true);
    };
    const handleCloseViewModal = () => {
        setViewModalOpen(false);
        setSelectedUser(null);
    };
    const handleExportCSV = () => {
        if (filteredUsers.length === 0) {
            toast.warning("No data available for export!");
            return;
        }
    
        // Convert data for export
        const processedData = filteredUsers.map(user => {
            // Extract semester grades dynamically
            const grades = user.grades || {};
            return {
                name: user.name,
                email: user.email,
                dob: user.dob.split("T")[0], // Remove timestamp
                gender: user.gender,
                address: user.address,
                contact: user.contact,
                religion: user.religion,
                community: user.community,
                minorityStatus: user.minorityStatus,
                residentialStatus: user.residentialStatus,
                admissionQuota: user.admissionQuota,
                country: user.country,
                course: user.course,
                department: user.department,
                yearOfAdmission: user.yearOfAdmission,
                "Semester 1": grades["Semester 1"] || "",
                "Semester 2": grades["Semester 2"] || "",
                "Semester 3": grades["Semester 3"] || "",
                "Semester 4": grades["Semester 4"] || "",
                "Semester 5": grades["Semester 5"] || "",
                "Semester 6": grades["Semester 6"] || "",
                "Semester 7": grades["Semester 7"] || "",
                "Semester 8": grades["Semester 8"] || "",
            };
        });
    
        // Convert data to CSV using Papa Parse
        const csvData = Papa.unparse(processedData);
    
        // Create a Blob and trigger the download
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "students_data.csv");
    };
    const handleExportExcel = () => {
        if (filteredUsers.length === 0) {
            toast.warning("No data available for export!");
            return;
        }
    
        // Convert data for export
        const processedData = filteredUsers.map(user => {
            // Extract semester grades dynamically
            const grades = user.grades || {};
            return {
                name: user.name,
                email: user.email,
                dob: user.dob.split("T")[0], // Remove timestamp
                gender: user.gender,
                address: user.address,
                contact: user.contact,
                religion: user.religion,
                community: user.community,
                minorityStatus: user.minorityStatus,
                residentialStatus: user.residentialStatus,
                admissionQuota: user.admissionQuota,
                country: user.country,
                course: user.course,
                department: user.department,
                yearOfAdmission: user.yearOfAdmission,
                "Semester 1": grades["Semester 1"] || "",
                "Semester 2": grades["Semester 2"] || "",
                "Semester 3": grades["Semester 3"] || "",
                "Semester 4": grades["Semester 4"] || "",
                "Semester 5": grades["Semester 5"] || "",
                "Semester 6": grades["Semester 6"] || "",
                "Semester 7": grades["Semester 7"] || "",
                "Semester 8": grades["Semester 8"] || "",
            };
        });
    
        // Convert to worksheet
        const worksheet = XLSX.utils.json_to_sheet(processedData);
    
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
        // Export as XLSX
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
        saveAs(blob, "students_data.xlsx");
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

    // Apply sorting and filtering
    const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName, filters);

    

    const isUserNotFound = filteredUsers.length === 0;

    return (
        <Page title="User">
            <Container>
            <Stack 
      direction={isMobile ? 'column' : 'row'} 
      alignItems={isMobile ? 'stretch' : 'center'} 
      justifyContent="space-between" 
      spacing={2} 
      mb={5}
    >
      <Typography variant="h4" gutterBottom>
        Student
      </Typography>

      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        spacing={2} 
        width={isMobile ? '100%' : 'auto'}
      >
        <Button 
          variant="contained" 
          onClick={handleAddModal} 
          startIcon={<Iconify icon="eva:plus-fill" />}
          fullWidth={isMobile}
        >
          New Student
        </Button>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExportCSV}
          startIcon={<Iconify icon="eva:download-fill" />}
          fullWidth={isMobile}
        >
          Export CSV
        </Button>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExportExcel}
          startIcon={<Iconify icon="eva:download-fill" />}
          fullWidth={isMobile}
        >
          Export Excel
        </Button>
      </Stack>
    </Stack>


                <Card  sx={{ minHeight: '500px', position: 'relative' }} >
                <StudentListToolbar
      numSelected={getVisibleSelectedCount()}
      selectedEmails={getSelectedEmails()}
      filterName={filterName}
      onFilterName={handleFilterByName}
      filters={filters}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
    />







                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                            <StudentListHead
        order={order}
        orderBy={orderBy}
        rowCount={filteredUsers.length}
        numSelected={getVisibleSelectedCount()}
        onSelectAllClick={handleSelectAllClick}
        onRequestSort={handleRequestSort}
        headLabel={TABLE_HEAD}
      />
                                <TableBody>
                                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                        const { _id, name,email, dob, gender, contact, address, religion, community, minorityStatus, residentialStatus, admissionQuota, country, course, department, yearOfAdmission, grades } = row;
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
                                                  <TableCell padding="checkbox">
                <Checkbox 
                  checked={isItemSelected} 
                  onChange={(event) => handleClick(event, email)} 
                />
              </TableCell>
                                                <TableCell align="left">
                                                    <IconButton onClick={() => handleViewStudent(row)} aria-label="view user">
                                                        <Iconify icon="eva:eye-fill" />
                                                    </IconButton>
                                                </TableCell>

                                                <TableCell align="left">{name}</TableCell>
                                                <TableCell align="left">{email || '-'}</TableCell>
                                                <TableCell align="left">{new Date(dob).toLocaleDateString()}</TableCell>
                                                <TableCell align="left">{gender}</TableCell>
                                                <TableCell align="left">{contact}</TableCell>
                                                <TableCell align="left">{address}</TableCell>
                                                <TableCell align="left">{religion}</TableCell>
                                                <TableCell align="left">{community}</TableCell>
                                                <TableCell align="left">{minorityStatus}</TableCell>
                                                <TableCell align="left">{residentialStatus}</TableCell>
                                                <TableCell align="left">{admissionQuota}</TableCell>
                                                <TableCell align="left">{country}</TableCell>
                                                <TableCell align="left">{course}</TableCell>
                                                <TableCell align="left">{department}</TableCell>
                                                <TableCell align="left">{yearOfAdmission}</TableCell>
                                                <TableCell align="left">
    {grades && Object.entries(grades).length > 0 ? (
        Object.entries(grades).map(([semester, grade]) => (
            <div key={semester}>{`${semester}: ${grade}`}</div>
        ))
    ) : (
        <div>No grades available</div>
    )}
</TableCell>




                                                <TableCell align="left">
                                                    <StudentMoreMenu
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
                    <StudentUserDialog
                        open={openModal}
                        onClose={handleCloseModal}
                        userId={editingUserId}
                        fetchUsers={fetchUsers}
                    />
                    <StudentAddUserDialog
                        open={AddModalOpen}
                        onClose={handleCloseAddModal}
                        userId={editingUserId}
                        fetchUsers={fetchUsers}
                    />
                    <StudentUserViewDialog
                        open={viewModalOpen}
                        onClose={handleCloseViewModal}
                        user={selectedUser}
                        userId={editingUserId}

                    />
                </Card>


            </Container>
        </Page>
    );
}
