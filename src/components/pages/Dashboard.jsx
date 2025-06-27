import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StatsCard from '@/components/molecules/StatsCard';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { SkeletonLoader, CardSkeleton } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import studentService from '@/services/api/studentService';
import classService from '@/services/api/classService';
import gradeService from '@/services/api/gradeService';
import attendanceService from '@/services/api/attendanceService';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [students, classes, grades, attendance] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);

      // Calculate stats
      const totalStudents = students.length;
      const totalClasses = classes.length;
      const activeStudents = students.filter(s => s.status === 'active').length;
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = todayAttendance.length > 0 
        ? Math.round((presentToday / todayAttendance.length) * 100) 
        : 100;

      // Average grade
      const totalGrades = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
      const averageGrade = grades.length > 0 ? Math.round(totalGrades / grades.length) : 0;

      setStats({
        totalStudents,
        totalClasses,
        activeStudents,
        attendanceRate,
        averageGrade,
        presentToday
      });

      // Recent activity (last 10 grades)
      const recentGrades = grades
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(grade => {
          const student = students.find(s => s.Id === grade.studentId);
          const classItem = classes.find(c => c.Id === grade.classId);
          return {
            id: grade.Id,
            type: 'grade',
            student: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
            class: classItem ? classItem.name : 'Unknown Class',
            assignment: grade.assignmentName,
            score: grade.score,
            maxScore: grade.maxScore,
            percentage: Math.round((grade.score / grade.maxScore) * 100),
            date: grade.date
          };
        });

      setRecentActivity(recentGrades);
      setTodayClasses(classes);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const quickActions = [
    {
      label: 'Add Student',
      icon: 'UserPlus',
      color: 'primary',
      onClick: () => navigate('/students')
    },
    {
      label: 'Mark Attendance',
      icon: 'CheckSquare',
      color: 'success',
      onClick: () => navigate('/attendance')
    },
    {
      label: 'Enter Grades',
      icon: 'Award',
      color: 'secondary',
      onClick: () => navigate('/grades')
    },
    {
      label: 'View Reports',
      icon: 'FileText',
      color: 'warning',
      onClick: () => navigate('/reports')
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={3} />
          <SkeletonLoader count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="Users"
          color="primary"
          trend="up"
          trendValue="+5 this month"
        />
        <StatsCard
          title="Active Classes"
          value={stats.totalClasses}
          icon="BookOpen"
          color="secondary"
        />
        <StatsCard
          title="Today's Attendance"
          value={`${stats.attendanceRate}%`}
          icon="CheckSquare"
          color="success"
          trend={stats.attendanceRate >= 85 ? 'up' : 'down'}
          trendValue={`${stats.presentToday} present`}
        />
        <StatsCard
          title="Class Average"
          value={`${stats.averageGrade}%`}
          icon="Award"
          color={stats.averageGrade >= 80 ? 'success' : 'warning'}
          trend={stats.averageGrade >= 75 ? 'up' : 'down'}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-20 flex-col gap-2"
                onClick={action.onClick}
              >
                <ApperIcon name={action.icon} size={24} />
                <span className="text-sm">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900">Recent Grades</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/grades')}>
              View All
              <ApperIcon name="ArrowRight" size={16} />
            </Button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Award" size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No recent grades to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 truncate">
                      {activity.student}
                    </p>
                    <p className="text-sm text-surface-600 truncate">
                      {activity.class} - {activity.assignment}
                    </p>
                    <p className="text-xs text-surface-500">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getGradeColor(activity.percentage)}>
                      {activity.percentage}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Classes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900">Today's Classes</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/classes')}>
              Manage
              <ApperIcon name="ArrowRight" size={16} />
            </Button>
          </div>
          
          {todayClasses.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="BookOpen" size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayClasses.slice(0, 5).map((classItem, index) => (
                <motion.div
                  key={classItem.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/attendance')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="BookOpen" size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{classItem.name}</p>
                      <p className="text-sm text-surface-600">
                        {classItem.subject} • {classItem.period} • {classItem.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {classItem.studentIds.length} students
                    </Badge>
                    <ApperIcon name="ChevronRight" size={16} className="text-surface-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;