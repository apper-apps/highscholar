import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import DataTable from '@/components/molecules/DataTable';
import GradeEntryForm from '@/components/organisms/GradeEntryForm';
import { SkeletonLoader, TableSkeleton } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import gradeService from '@/services/api/gradeService';
import studentService from '@/services/api/studentService';
import classService from '@/services/api/classService';
import { format } from 'date-fns';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterGrades();
  }, [grades, students, classes, searchQuery, selectedClass, sortField, sortDirection]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [gradesData, studentsData, classesData] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      setError(err.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = [...grades];

    // Add student and class info to each grade
    filtered = filtered.map(grade => {
      const student = students.find(s => s.Id === grade.studentId);
      const classItem = classes.find(c => c.Id === grade.classId);
      return {
        ...grade,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        className: classItem ? classItem.name : 'Unknown Class',
        subject: classItem ? classItem.subject : 'Unknown Subject',
        percentage: Math.round((grade.score / grade.maxScore) * 100)
      };
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(grade =>
        grade.studentName.toLowerCase().includes(query) ||
        grade.className.toLowerCase().includes(query) ||
        grade.assignmentName.toLowerCase().includes(query)
      );
    }

    // Class filter
    if (selectedClass) {
      filtered = filtered.filter(grade => grade.classId === parseInt(selectedClass, 10));
    }

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by date (newest first)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredGrades(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleAddGrade = () => {
    setEditingGrade(null);
    setShowForm(true);
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setShowForm(true);
  };

  const handleDeleteGrade = async (grade) => {
    if (window.confirm(`Are you sure you want to delete this grade for ${grade.studentName}?`)) {
      try {
        await gradeService.delete(grade.Id);
        await loadData();
        toast.success('Grade deleted successfully');
      } catch (error) {
        toast.error('Failed to delete grade');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      if (editingGrade) {
        await gradeService.update(editingGrade.Id, formData);
        toast.success('Grade updated successfully');
      } else {
        await gradeService.create(formData);
        toast.success('Grade added successfully');
      }
      
      setShowForm(false);
      setEditingGrade(null);
      await loadData();
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGrade(null);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student',
      sortable: true,
      render: (value, grade) => (
        <div>
          <p className="font-medium text-surface-900">{value}</p>
          <p className="text-sm text-surface-600">{grade.className}</p>
        </div>
      )
    },
    {
      key: 'assignmentName',
      label: 'Assignment',
      sortable: true,
      render: (value, grade) => (
        <div>
          <p className="font-medium text-surface-900">{value}</p>
          <p className="text-sm text-surface-600">{grade.subject}</p>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (value, grade) => (
        <div className="text-center">
          <p className="font-medium text-surface-900">
            {value}/{grade.maxScore}
          </p>
          <Badge variant={getGradeColor(grade.percentage)} size="sm">
            {grade.percentage}% ({getLetterGrade(grade.percentage)})
          </Badge>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy')
    }
  ];

  const actions = [
    {
      icon: 'Edit',
      onClick: handleEditGrade
    },
    {
      icon: 'Trash2',
      onClick: handleDeleteGrade
    }
  ];

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GradeEntryForm
          grade={editingGrade}
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
          <TableSkeleton rows={5} columns={4} />
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const getClassAverage = () => {
    if (filteredGrades.length === 0) return 0;
    const total = filteredGrades.reduce((sum, grade) => sum + grade.percentage, 0);
    return Math.round(total / filteredGrades.length);
  };

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
              Grade Management
            </h3>
            <p className="text-sm text-surface-600">
              Enter and manage student grades and assignments
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {filteredGrades.length > 0 && (
              <Badge variant="secondary">
                Class Average: {getClassAverage()}%
              </Badge>
            )}
            <Button onClick={handleAddGrade} icon="Plus">
              Add Grade
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by student name, class, or assignment..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          
          <div className="md:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map(classItem => (
                <option key={classItem.Id} value={classItem.Id.toString()}>
                  {classItem.name} ({classItem.subject})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Grades Table */}
      <Card padding="none">
        {filteredGrades.length === 0 ? (
          <EmptyState
            title="No grades found"
            description={searchQuery || selectedClass 
              ? "Try adjusting your search filters to find grades."
              : "Add the first grade to start tracking student performance."
            }
            actionLabel={!searchQuery && !selectedClass ? "Add First Grade" : null}
            onAction={!searchQuery && !selectedClass ? handleAddGrade : null}
            icon="Award"
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredGrades}
            onSort={handleSort}
            actions={actions}
          />
        )}
      </Card>

      {/* Grade Distribution */}
      {filteredGrades.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['A', 'B', 'C', 'D', 'F'].map(letter => {
            const count = filteredGrades.filter(grade => getLetterGrade(grade.percentage) === letter).length;
            const percentage = Math.round((count / filteredGrades.length) * 100);
            
            return (
              <Card key={letter}>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                    letter === 'A' ? 'bg-success-100' :
                    letter === 'B' ? 'bg-primary-100' :
                    letter === 'C' ? 'bg-warning-100' :
                    'bg-accent-100'
                  }`}>
                    <span className={`text-xl font-bold ${
                      letter === 'A' ? 'text-success-600' :
                      letter === 'B' ? 'text-primary-600' :
                      letter === 'C' ? 'text-warning-600' :
                      'text-accent-600'
                    }`}>
                      {letter}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-surface-900">{count}</p>
                  <p className="text-sm text-surface-600">{percentage}%</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Grades;