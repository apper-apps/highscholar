import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import classService from '@/services/api/classService';

const GradeEntryForm = ({ grade, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    studentId: grade?.studentId || '',
    classId: grade?.classId || '',
    assignmentName: grade?.assignmentName || '',
    score: grade?.score || '',
    maxScore: grade?.maxScore || 100,
    date: grade?.date || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsData, classesData] = await Promise.all([
          studentService.getAll(),
          classService.getAll()
        ]);
        setStudents(studentsData);
        setClasses(classesData);
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const studentOptions = students.map(student => ({
    value: student.Id.toString(),
    label: `${student.firstName} ${student.lastName}`
  }));

  const classOptions = classes.map(classItem => ({
    value: classItem.Id.toString(),
    label: `${classItem.name} (${classItem.subject})`
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Student is required';
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    if (!formData.assignmentName.trim()) {
      newErrors.assignmentName = 'Assignment name is required';
    }

    if (!formData.score) {
      newErrors.score = 'Score is required';
    } else if (isNaN(formData.score) || formData.score < 0) {
      newErrors.score = 'Score must be a valid number';
    } else if (parseFloat(formData.score) > parseFloat(formData.maxScore)) {
      newErrors.score = 'Score cannot exceed maximum score';
    }

    if (!formData.maxScore) {
      newErrors.maxScore = 'Maximum score is required';
    } else if (isNaN(formData.maxScore) || formData.maxScore <= 0) {
      newErrors.maxScore = 'Maximum score must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const gradeData = {
        ...formData,
        studentId: parseInt(formData.studentId, 10),
        classId: parseInt(formData.classId, 10),
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        assignmentId: `assign_${Date.now()}`
      };
      
      await onSubmit(gradeData);
    } catch (error) {
      toast.error('Failed to save grade');
    }
  };

  const getPercentage = () => {
    if (formData.score && formData.maxScore) {
      const percentage = (parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100;
      return Math.round(percentage);
    }
    return 0;
  };

  if (loadingData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-surface-600">Loading form data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
          <ApperIcon name="Award" size={20} className="text-secondary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900">
            {grade ? 'Edit Grade' : 'Add New Grade'}
          </h2>
          <p className="text-sm text-surface-600">
            {grade ? 'Update grade information' : 'Enter grade details for the assignment'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Student"
            value={formData.studentId}
            onChange={handleChange('studentId')}
            options={studentOptions}
            error={errors.studentId}
            required
          />

          <FormField
            type="select"
            label="Class"
            value={formData.classId}
            onChange={handleChange('classId')}
            options={classOptions}
            error={errors.classId}
            required
          />
        </div>

        <FormField
          label="Assignment Name"
          value={formData.assignmentName}
          onChange={handleChange('assignmentName')}
          error={errors.assignmentName}
          required
          icon="FileText"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField
            label="Score"
            type="number"
            value={formData.score}
            onChange={handleChange('score')}
            error={errors.score}
            required
            icon="Hash"
            min="0"
            step="0.5"
          />

          <FormField
            label="Maximum Score"
            type="number"
            value={formData.maxScore}
            onChange={handleChange('maxScore')}
            error={errors.maxScore}
            required
            icon="Hash"
            min="1"
            step="0.5"
          />

          <div className="p-3 bg-surface-50 rounded-lg">
            <p className="text-sm text-surface-600 mb-1">Percentage</p>
            <p className="text-2xl font-bold text-primary-900">{getPercentage()}%</p>
          </div>
        </div>

        <FormField
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleChange('date')}
          icon="Calendar"
        />

        <div className="flex gap-4 pt-6 border-t border-surface-200">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            <ApperIcon name="Save" size={16} />
            {grade ? 'Update Grade' : 'Add Grade'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GradeEntryForm;