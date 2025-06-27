import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';

const StudentForm = ({ student, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    grade: student?.grade || '',
    enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
    parentContact: student?.parentContact || '',
    status: student?.status || 'active'
  });

  const [errors, setErrors] = useState({});

  const gradeOptions = [
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'transferred', label: 'Transferred' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.parentContact.trim()) {
      newErrors.parentContact = 'Parent contact is required';
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
      await onSubmit(formData);
    } catch (error) {
      toast.error('Failed to save student');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <ApperIcon name="UserPlus" size={20} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <p className="text-sm text-surface-600">
            {student ? 'Update student information' : 'Enter student details to add them to the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            required
            icon="User"
          />

          <FormField
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            required
            icon="User"
          />
        </div>

        <FormField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          required
          icon="Mail"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Grade"
            value={formData.grade}
            onChange={handleChange('grade')}
            options={gradeOptions}
            error={errors.grade}
            required
          />

          <FormField
            type="select"
            label="Status"
            value={formData.status}
            onChange={handleChange('status')}
            options={statusOptions}
            error={errors.status}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Enrollment Date"
            type="date"
            value={formData.enrollmentDate}
            onChange={handleChange('enrollmentDate')}
            icon="Calendar"
          />

          <FormField
            label="Parent Contact"
            value={formData.parentContact}
            onChange={handleChange('parentContact')}
            error={errors.parentContact}
            required
            icon="Phone"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-surface-200">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            <ApperIcon name="Save" size={16} />
            {student ? 'Update Student' : 'Add Student'}
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

export default StudentForm;