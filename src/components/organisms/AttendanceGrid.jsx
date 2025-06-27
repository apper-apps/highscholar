import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import classService from '@/services/api/classService';
import attendanceService from '@/services/api/attendanceService';

const AttendanceGrid = ({ selectedDate = new Date().toISOString().split('T')[0] }) => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].Id.toString());
      }
      
      if (selectedClass) {
        await loadAttendance();
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!selectedClass) return;
    
    try {
      const attendanceData = await attendanceService.getByDate(selectedDate);
      const classAttendance = attendanceData.filter(record => 
        record.classId === parseInt(selectedClass, 10)
      );
      
      const attendanceMap = {};
      classAttendance.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });
      
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const getClassStudents = () => {
    if (!selectedClass) return [];
    
    const currentClass = classes.find(c => c.Id === parseInt(selectedClass, 10));
    if (!currentClass) return [];
    
    return students.filter(student => 
      currentClass.studentIds.includes(student.Id)
    );
  };

  const updateAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId, 10),
        classId: parseInt(selectedClass, 10),
        date: selectedDate,
        status,
        notes: ''
      }));
      
      await attendanceService.bulkUpdate(records);
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'Check';
      case 'absent': return 'X';
      case 'late': return 'Clock';
      case 'excused': return 'FileCheck';
      default: return 'Minus';
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'success' },
    { value: 'absent', label: 'Absent', color: 'danger' },
    { value: 'late', label: 'Late', color: 'warning' },
    { value: 'excused', label: 'Excused', color: 'secondary' }
  ];

  const getSummary = () => {
    const classStudents = getClassStudents();
    const totalStudents = classStudents.length;
    const marked = Object.keys(attendance).length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    
    return { totalStudents, marked, present, absent, late };
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-surface-600">Loading attendance data...</p>
        </div>
      </Card>
    );
  }

  const classStudents = getClassStudents();
  const summary = getSummary();
  const currentClass = classes.find(c => c.Id === parseInt(selectedClass, 10));

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {classes.map(classItem => (
                <option key={classItem.Id} value={classItem.Id.toString()}>
                  {classItem.name} ({classItem.subject}) - {classItem.period}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-surface-600">
              Date: {new Date(selectedDate).toLocaleDateString()}
            </div>
            <Button
              onClick={saveAttendance}
              loading={saving}
              disabled={Object.keys(attendance).length === 0}
            >
              <ApperIcon name="Save" size={16} />
              Save Attendance
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      {currentClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-900">{summary.totalStudents}</p>
              <p className="text-sm text-surface-600">Total Students</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{summary.present}</p>
              <p className="text-sm text-surface-600">Present</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-600">{summary.absent}</p>
              <p className="text-sm text-surface-600">Absent</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">{summary.late}</p>
              <p className="text-sm text-surface-600">Late</p>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Grid */}
      {currentClass && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-surface-900">
              {currentClass.name} - Attendance
            </h3>
            <p className="text-sm text-surface-600">
              Mark attendance for {classStudents.length} students
            </p>
          </div>

          {classStudents.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Users" size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No students enrolled in this class</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classStudents.map((student, index) => (
                <motion.div
                  key={student.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-surface-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-surface-600">Grade {student.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {attendance[student.Id] && (
                      <Badge variant={getStatusColor(attendance[student.Id])}>
                        <ApperIcon name={getStatusIcon(attendance[student.Id])} size={14} />
                        {attendance[student.Id]}
                      </Badge>
                    )}
                    
                    <div className="flex gap-1">
                      {statusOptions.map(option => (
                        <Button
                          key={option.value}
                          variant={attendance[student.Id] === option.value ? option.color : 'outline'}
                          size="sm"
                          onClick={() => updateAttendance(student.Id, option.value)}
                        >
                          <ApperIcon name={getStatusIcon(option.value)} size={14} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AttendanceGrid;