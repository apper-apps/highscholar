import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import DataTable from '@/components/molecules/DataTable';
import StudentForm from '@/components/organisms/StudentForm';
import { SkeletonLoader, TableSkeleton } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import { format } from 'date-fns';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, selectedGrade, sortField, sortDirection]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
      );
    }

    // Grade filter
    if (selectedGrade) {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'enrollmentDate') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      try {
        await studentService.delete(student.Id);
        await loadStudents();
        toast.success('Student deleted successfully');
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.Id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentService.create(formData);
        toast.success('Student added successfully');
      }
      
      setShowForm(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'graduated': return 'primary';
      case 'transferred': return 'warning';
      default: return 'default';
    }
  };

  const gradeOptions = ['9', '10', '11', '12'];

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (value, student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-sm font-medium">
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-surface-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-surface-600">{student.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'grade',
      label: 'Grade',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">Grade {value}</Badge>
      )
    },
    {
      key: 'enrollmentDate',
      label: 'Enrollment Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy')
    },
    {
      key: 'parentContact',
      label: 'Parent Contact',
      sortable: false
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    }
  ];

  const actions = [
    {
      icon: 'Edit',
      onClick: handleEditStudent
    },
    {
      icon: 'Trash2',
      onClick: handleDeleteStudent
    }
  ];

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StudentForm
          student={editingStudent}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={1} />
        <Card>
          <TableSkeleton rows={5} columns={5} />
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStudents} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">
              Student Management
            </h3>
            <p className="text-sm text-surface-600">
              Manage student records and information
            </p>
          </div>
          
          <Button onClick={handleAddStudent} icon="UserPlus">
            Add Student
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search students by name or email..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          
          <div className="md:w-48">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
            >
              <option value="">All Grades</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card padding="none">
        {filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            description={searchQuery || selectedGrade 
              ? "Try adjusting your search filters to find students."
              : "Add your first student to get started with managing student records."
            }
            actionLabel={!searchQuery && !selectedGrade ? "Add First Student" : null}
            onAction={!searchQuery && !selectedGrade ? handleAddStudent : null}
            icon="Users"
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            onSort={handleSort}
            actions={actions}
          />
        )}
      </Card>

      {/* Stats Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {gradeOptions.map(grade => {
            const count = students.filter(s => s.grade === grade).length;
            return (
              <Card key={grade}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-900">{count}</p>
                  <p className="text-sm text-surface-600">Grade {grade} Students</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Students;