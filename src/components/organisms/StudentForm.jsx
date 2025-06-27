import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
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
    status: student?.status || 'active',
    photoUrl: student?.photoUrl || '',
    hobbies: student?.hobbies || '',
    interests: student?.interests || '',
    bio: student?.bio || ''
  });

  const [photoPreview, setPhotoPreview] = useState(student?.photoUrl || '');
  const [uploadedFile, setUploadedFile] = useState(null);
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
const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          photoUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

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

  const removePhoto = () => {
    setPhotoPreview('');
    setUploadedFile(null);
    setFormData(prev => ({
      ...prev,
      photoUrl: ''
    }));
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

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ApperIcon name="Camera" size={16} className="text-surface-600" />
            <h3 className="text-sm font-medium text-surface-900">Profile Photo</h3>
          </div>
          
          <div className="flex items-start gap-4">
            {/* Photo Preview */}
            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-lg object-cover border border-surface-200"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <ApperIcon name="X" size={12} />
                </button>
              </div>
            )}
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-surface-300 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <input {...getInputProps()} />
              <ApperIcon name="Upload" size={24} className="mx-auto mb-2 text-surface-400" />
              <p className="text-sm text-surface-600">
                {isDragActive 
                  ? 'Drop the photo here...' 
                  : 'Drag & drop a photo here, or click to select'
                }
              </p>
              <p className="text-xs text-surface-500 mt-1">
                Supports JPG, PNG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Customization Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ApperIcon name="Sparkles" size={16} className="text-surface-600" />
            <h3 className="text-sm font-medium text-surface-900">Additional Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Hobbies"
              value={formData.hobbies}
              onChange={handleChange('hobbies')}
              placeholder="e.g., Reading, Swimming, Photography"
              icon="Heart"
            />

            <FormField
              label="Interests"
              value={formData.interests}
              onChange={handleChange('interests')}
              placeholder="e.g., Science, Technology, Art"
              icon="Star"
            />
          </div>

          <FormField
            label="Bio"
            type="textarea"
            rows={3}
            value={formData.bio}
            onChange={handleChange('bio')}
            placeholder="Tell us about yourself..."
            icon="FileText"
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