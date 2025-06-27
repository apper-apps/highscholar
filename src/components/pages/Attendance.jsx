import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import AttendanceGrid from '@/components/organisms/AttendanceGrid';
import { SkeletonLoader } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import attendanceService from '@/services/api/attendanceService';
import studentService from '@/services/api/studentService';
import classService from '@/services/api/classService';
import { format, subDays, addDays } from 'date-fns';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttendanceSummary();
  }, [selectedDate]);

  const loadAttendanceSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [attendance, students, classes] = await Promise.all([
        attendanceService.getByDate(selectedDate),
        studentService.getAll(),
        classService.getAll()
      ]);

      // Calculate summary stats
      const totalStudents = students.length;
      const totalRecords = attendance.length;
      const presentCount = attendance.filter(a => a.status === 'present').length;
      const absentCount = attendance.filter(a => a.status === 'absent').length;
      const lateCount = attendance.filter(a => a.status === 'late').length;
      const excusedCount = attendance.filter(a => a.status === 'excused').length;

      setAttendanceSummary({
        totalStudents,
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100
      });

    } catch (err) {
      setError(err.message || 'Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1);
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  if (error) {
    return <ErrorState message={error} onRetry={loadAttendanceSummary} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">
              Attendance Management
            </h3>
            <p className="text-sm text-surface-600">
              Mark and track student attendance for classes
            </p>
          </div>
        </div>
      </Card>

      {/* Date Navigation */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              icon="ChevronLeft"
            />
            
            <div className="flex items-center gap-3">
              <ApperIcon name="Calendar" size={20} className="text-primary-600" />
              <div>
                <p className="font-medium text-surface-900">
                  {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-surface-600">
                  {isToday ? 'Today' : format(new Date(selectedDate), 'EEEE')}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              icon="ChevronRight"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Go to Today
              </Button>
            )}
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Attendance Summary */}
      {loading ? (
        <SkeletonLoader count={1} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Users" size={24} className="text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{attendanceSummary.totalRecords || 0}</p>
              <p className="text-sm text-surface-600">Records Marked</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Check" size={24} className="text-success-600" />
              </div>
              <p className="text-2xl font-bold text-success-600">{attendanceSummary.presentCount || 0}</p>
              <p className="text-sm text-surface-600">Present</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="X" size={24} className="text-accent-600" />
              </div>
              <p className="text-2xl font-bold text-accent-600">{attendanceSummary.absentCount || 0}</p>
              <p className="text-sm text-surface-600">Absent</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Clock" size={24} className="text-warning-600" />
              </div>
              <p className="text-2xl font-bold text-warning-600">{attendanceSummary.lateCount || 0}</p>
              <p className="text-sm text-surface-600">Late</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Percent" size={24} className="text-secondary-600" />
              </div>
              <p className="text-2xl font-bold text-secondary-600">{attendanceSummary.attendanceRate || 0}%</p>
              <p className="text-sm text-surface-600">Attendance Rate</p>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Grid */}
      <AttendanceGrid selectedDate={selectedDate} />
      
      {/* Quick Stats */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-surface-900 mb-1">Daily Summary</h4>
            <p className="text-sm text-surface-600">
              Attendance overview for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-success-600">
                {attendanceSummary.attendanceRate || 0}%
              </p>
              <p className="text-xs text-surface-600">Overall Rate</p>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-bold text-primary-600">
                {attendanceSummary.totalRecords || 0}
              </p>
              <p className="text-xs text-surface-600">Total Marked</p>
            </div>
          </div>
        </div>
        
        {attendanceSummary.totalRecords > 0 && (
          <div className="mt-4 flex gap-2">
            <div 
              className="h-2 bg-success-200 rounded-full flex-1" 
              style={{ 
                width: `${((attendanceSummary.presentCount || 0) / attendanceSummary.totalRecords) * 100}%` 
              }}
            />
            <div 
              className="h-2 bg-accent-200 rounded-full flex-1" 
              style={{ 
                width: `${((attendanceSummary.absentCount || 0) / attendanceSummary.totalRecords) * 100}%` 
              }}
            />
            <div 
              className="h-2 bg-warning-200 rounded-full flex-1" 
              style={{ 
                width: `${((attendanceSummary.lateCount || 0) / attendanceSummary.totalRecords) * 100}%` 
              }}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default Attendance;