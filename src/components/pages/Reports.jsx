import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { SkeletonLoader } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import gradeService from '@/services/api/gradeService';
import attendanceService from '@/services/api/attendanceService';
import classService from '@/services/api/classService';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Reports = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('current_month');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [students, grades, attendance, classes] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll(),
        classService.getAll()
      ]);

      // Calculate date range
      const now = new Date();
      let startDate, endDate;
      
      switch (dateRange) {
        case 'current_month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'last_month':
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case 'current_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(0);
          endDate = now;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Filter data by date range
      const filteredGrades = grades.filter(grade => 
        grade.date >= startDateStr && grade.date <= endDateStr
      );
      const filteredAttendance = attendance.filter(record => 
        record.date >= startDateStr && record.date <= endDateStr
      );

      // Generate comprehensive report data
      const data = {
        overview: generateOverviewReport(students, filteredGrades, filteredAttendance, classes),
        students: generateStudentReport(students, filteredGrades, filteredAttendance),
        classes: generateClassReport(classes, students, filteredGrades, filteredAttendance),
        performance: generatePerformanceReport(filteredGrades, students, classes),
        attendance: generateAttendanceReport(filteredAttendance, students, classes)
      };

      setReportData(data);

    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateOverviewReport = (students, grades, attendance, classes) => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalClasses = classes.length;
    
    // Grade statistics
    const totalGrades = grades.length;
    const averageGrade = grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
      : 0;
    
    // Attendance statistics
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100)
      : 100;

    // Grade distribution
    const gradeDistribution = {
      A: grades.filter(g => (g.score / g.maxScore) * 100 >= 90).length,
      B: grades.filter(g => {
        const pct = (g.score / g.maxScore) * 100;
        return pct >= 80 && pct < 90;
      }).length,
      C: grades.filter(g => {
        const pct = (g.score / g.maxScore) * 100;
        return pct >= 70 && pct < 80;
      }).length,
      D: grades.filter(g => {
        const pct = (g.score / g.maxScore) * 100;
        return pct >= 60 && pct < 70;
      }).length,
      F: grades.filter(g => (g.score / g.maxScore) * 100 < 60).length
    };

    return {
      totalStudents,
      activeStudents,
      totalClasses,
      totalGrades,
      averageGrade,
      attendanceRate,
      gradeDistribution,
      trends: {
        studentGrowth: '+5 this month',
        gradeImprovement: averageGrade >= 75 ? '+3.2%' : '-1.8%',
        attendanceChange: attendanceRate >= 85 ? '+2.1%' : '-4.3%'
      }
    };
  };

  const generateStudentReport = (students, grades, attendance) => {
    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.Id);
      const studentAttendance = attendance.filter(a => a.studentId === student.Id);
      
      const averageGrade = studentGrades.length > 0
        ? Math.round(studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length)
        : 0;
      
      const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
        : 100;

      return {
        ...student,
        averageGrade,
        attendanceRate,
        totalAssignments: studentGrades.length,
        totalAttendanceRecords: studentAttendance.length
      };
    });
  };

  const generateClassReport = (classes, students, grades, attendance) => {
    return classes.map(classItem => {
      const classGrades = grades.filter(g => g.classId === classItem.Id);
      const classAttendance = attendance.filter(a => a.classId === classItem.Id);
      const enrolledStudents = students.filter(s => classItem.studentIds.includes(s.Id));
      
      const averageGrade = classGrades.length > 0
        ? Math.round(classGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / classGrades.length)
        : 0;
      
      const attendanceRate = classAttendance.length > 0
        ? Math.round((classAttendance.filter(a => a.status === 'present').length / classAttendance.length) * 100)
        : 100;

      return {
        ...classItem,
        enrolledCount: enrolledStudents.length,
        averageGrade,
        attendanceRate,
        totalAssignments: classGrades.length,
        totalAttendanceRecords: classAttendance.length
      };
    });
  };

  const generatePerformanceReport = (grades, students, classes) => {
    // Top performing students
    const studentPerformance = students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.Id);
      const averageGrade = studentGrades.length > 0
        ? studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length
        : 0;
      
      return {
        ...student,
        averageGrade: Math.round(averageGrade),
        totalGrades: studentGrades.length
      };
    }).sort((a, b) => b.averageGrade - a.averageGrade);

    // Subject performance
    const subjectPerformance = {};
    classes.forEach(classItem => {
      const subjectGrades = grades.filter(g => g.classId === classItem.Id);
      if (subjectGrades.length > 0) {
        const average = subjectGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / subjectGrades.length;
        subjectPerformance[classItem.subject] = {
          average: Math.round(average),
          totalGrades: subjectGrades.length
        };
      }
    });

    return {
      topStudents: studentPerformance.slice(0, 10),
      subjectPerformance
    };
  };

  const generateAttendanceReport = (attendance, students, classes) => {
    // Student attendance ranking
    const studentAttendance = students.map(student => {
      const records = attendance.filter(a => a.studentId === student.Id);
      const rate = records.length > 0
        ? Math.round((records.filter(a => a.status === 'present').length / records.length) * 100)
        : 100;
      
      return {
        ...student,
        attendanceRate: rate,
        totalRecords: records.length,
        presentDays: records.filter(a => a.status === 'present').length,
        absentDays: records.filter(a => a.status === 'absent').length,
        lateDays: records.filter(a => a.status === 'late').length
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Class attendance
    const classAttendance = classes.map(classItem => {
      const records = attendance.filter(a => a.classId === classItem.Id);
      const rate = records.length > 0
        ? Math.round((records.filter(a => a.status === 'present').length / records.length) * 100)
        : 100;
      
      return {
        ...classItem,
        attendanceRate: rate,
        totalRecords: records.length
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    return {
      studentRankings: studentAttendance,
      classRankings: classAttendance
    };
  };

  const exportReport = (format) => {
    const reportContent = JSON.stringify(reportData[selectedReport], null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_report.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${selectedReport} report exported successfully`);
  };

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'students', label: 'Students', icon: 'Users' },
    { id: 'classes', label: 'Classes', icon: 'BookOpen' },
    { id: 'performance', label: 'Performance', icon: 'Award' },
    { id: 'attendance', label: 'Attendance', icon: 'CheckSquare' }
  ];

  const dateRangeOptions = [
    { value: 'current_month', label: 'Current Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'current_year', label: 'Current Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadReportData} />;
  }

  const currentReportData = reportData[selectedReport] || {};

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
              Reports & Analytics
            </h3>
            <p className="text-sm text-surface-600">
              Generate comprehensive reports on student performance and attendance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              onClick={() => exportReport('json')}
              variant="outline"
              size="sm"
              icon="Download"
            >
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Type Selector */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {reportTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedReport === type.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedReport(type.id)}
              icon={type.icon}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ApperIcon name="Users" size={24} className="text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-surface-900">{currentReportData.totalStudents}</p>
                <p className="text-sm text-surface-600">Total Students</p>
                <Badge variant="success" size="sm" className="mt-2">
                  {currentReportData.trends?.studentGrowth}
                </Badge>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ApperIcon name="BookOpen" size={24} className="text-secondary-600" />
                </div>
                <p className="text-2xl font-bold text-surface-900">{currentReportData.totalClasses}</p>
                <p className="text-sm text-surface-600">Active Classes</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ApperIcon name="Award" size={24} className="text-success-600" />
                </div>
                <p className="text-2xl font-bold text-surface-900">{currentReportData.averageGrade}%</p>
                <p className="text-sm text-surface-600">Average Grade</p>
                <Badge 
                  variant={currentReportData.averageGrade >= 75 ? 'success' : 'warning'} 
                  size="sm" 
                  className="mt-2"
                >
                  {currentReportData.trends?.gradeImprovement}
                </Badge>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ApperIcon name="CheckSquare" size={24} className="text-warning-600" />
                </div>
                <p className="text-2xl font-bold text-surface-900">{currentReportData.attendanceRate}%</p>
                <p className="text-sm text-surface-600">Attendance Rate</p>
                <Badge 
                  variant={currentReportData.attendanceRate >= 85 ? 'success' : 'warning'} 
                  size="sm" 
                  className="mt-2"
                >
                  {currentReportData.trends?.attendanceChange}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <h4 className="text-lg font-semibold text-surface-900 mb-4">Grade Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(currentReportData.gradeDistribution || {}).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    grade === 'A' ? 'bg-success-100' :
                    grade === 'B' ? 'bg-primary-100' :
                    grade === 'C' ? 'bg-warning-100' :
                    'bg-accent-100'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      grade === 'A' ? 'text-success-600' :
                      grade === 'B' ? 'text-primary-600' :
                      grade === 'C' ? 'text-warning-600' :
                      'text-accent-600'
                    }`}>
                      {grade}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-surface-900">{count}</p>
                  <p className="text-sm text-surface-600">
                    {currentReportData.totalGrades > 0 
                      ? Math.round((count / currentReportData.totalGrades) * 100)
                      : 0
                    }%
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'students' && (
        <Card>
          <h4 className="text-lg font-semibold text-surface-900 mb-4">Student Performance Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-700">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-700">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-700">Avg. Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-700">Attendance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-700">Assignments</th>
                </tr>
              </thead>
              <tbody>
                {(currentReportData || []).slice(0, 10).map((student, index) => (
                  <tr key={student.Id} className="border-b border-surface-100">
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Grade {student.grade}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.averageGrade >= 80 ? 'success' : student.averageGrade >= 70 ? 'warning' : 'danger'}>
                        {student.averageGrade}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.attendanceRate >= 85 ? 'success' : 'warning'}>
                        {student.attendanceRate}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-900">
                      {student.totalAssignments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedReport === 'performance' && currentReportData.topStudents && (
        <div className="space-y-6">
          <Card>
            <h4 className="text-lg font-semibold text-surface-900 mb-4">Top Performing Students</h4>
            <div className="space-y-3">
              {currentReportData.topStudents.slice(0, 5).map((student, index) => (
                <div key={student.Id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-primary-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-surface-600">Grade {student.grade}</p>
                    </div>
                  </div>
                  <Badge variant="success">{student.averageGrade}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="text-lg font-semibold text-surface-900 mb-4">Subject Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentReportData.subjectPerformance || {}).map(([subject, data]) => (
                <div key={subject} className="p-4 bg-surface-50 rounded-lg">
                  <h5 className="font-medium text-surface-900 mb-2">{subject}</h5>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-600">Average: {data.average}%</span>
                    <Badge variant={data.average >= 80 ? 'success' : data.average >= 70 ? 'warning' : 'danger'}>
                      {data.totalGrades} grades
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;