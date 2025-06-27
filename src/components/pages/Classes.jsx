import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import EmptyState from "@/components/organisms/EmptyState";
import { CardSkeleton, SkeletonLoader } from "@/components/organisms/LoadingStates";
import ErrorState from "@/components/organisms/ErrorState";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(classItem =>
        classItem.name.toLowerCase().includes(query) ||
        classItem.subject.toLowerCase().includes(query) ||
        classItem.period.toLowerCase().includes(query) ||
        classItem.room.toLowerCase().includes(query)
      );
    }

    setFilteredClasses(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getEnrolledStudents = (classItem) => {
    return students.filter(student => 
      classItem.studentIds.includes(student.Id)
    );
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'primary',
      'English': 'success',
      'Science': 'secondary',
      'History': 'warning',
      'Art': 'danger'
    };
    return colors[subject] || 'default';
  };

  const getPeriodIcon = (period) => {
    const periodNumber = period.match(/\d+/)?.[0];
    switch (periodNumber) {
      case '1': return 'Sun';
      case '2': return 'Clock9';
      case '3': return 'Clock12';
      case '4': return 'Clock3';
      case '5': return 'Clock6';
      default: return 'Clock';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={1} />
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
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
              Class Management
            </h3>
            <p className="text-sm text-surface-600">
              Overview of all classes and their enrollment
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {classes.length} Total Classes
            </Badge>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card>
        <SearchBar
          placeholder="Search classes by name, subject, period, or room..."
          onSearch={handleSearch}
          className="w-full"
        />
      </Card>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No classes found"
          description={searchQuery 
            ? "Try adjusting your search to find classes."
            : "No classes have been created yet."
          }
          icon="BookOpen"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem, index) => {
            const enrolledStudents = getEnrolledStudents(classItem);
            
            return (
              <motion.div
                key={classItem.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="BookOpen" size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-900 text-lg">
                          {classItem.name}
                        </h4>
                        <Badge variant={getSubjectColor(classItem.subject)} size="sm">
                          {classItem.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-surface-600">
                      <ApperIcon name={getPeriodIcon(classItem.period)} size={16} />
                      {classItem.period}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-surface-600">
                      <ApperIcon name="MapPin" size={16} />
                      {classItem.room}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-surface-600">
                      <ApperIcon name="Users" size={16} />
                      {enrolledStudents.length} Students Enrolled
                    </div>
                  </div>

                  {/* Student Avatars */}
                  {enrolledStudents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-surface-700 mb-2">
                        Enrolled Students:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {enrolledStudents.slice(0, 6).map(student => (
                          <div
                            key={student.Id}
                            className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center"
                            title={`${student.firstName} ${student.lastName}`}
                          >
                            <span className="text-secondary-700 text-xs font-medium">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                        ))}
                        {enrolledStudents.length > 6 && (
                          <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                            <span className="text-surface-600 text-xs">
                              +{enrolledStudents.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-surface-200">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ApperIcon name="CheckSquare" size={14} />
                      Attendance
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ApperIcon name="Award" size={14} />
                      Grades
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="BookOpen" size={24} className="text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{classes.length}</p>
              <p className="text-sm text-surface-600">Total Classes</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Users" size={24} className="text-success-600" />
              </div>
              <p className="text-2xl font-bold text-surface-900">
                {Math.round(classes.reduce((sum, c) => sum + c.studentIds.length, 0) / classes.length) || 0}
              </p>
              <p className="text-sm text-surface-600">Avg. Enrollment</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ApperIcon name="Calendar" size={24} className="text-secondary-600" />
              </div>
              <p className="text-2xl font-bold text-surface-900">
                {new Set(classes.map(c => c.subject)).size}
              </p>
              <p className="text-sm text-surface-600">Subjects</p>
            </div>
</div>
          </Card>
        </div>
      )}

      {/* Calendar Widget */}
      {classes.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-900">
                Upcoming Assignments & Events
              </h3>
              <p className="text-sm text-surface-600">
                Quick overview of class schedules and due dates
              </p>
            </div>
            <Button variant="outline" size="sm">
              <ApperIcon name="Calendar" size={14} />
              View Full Calendar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classes.map(classItem => {
              const assignments = classItem.assignments || [];
              const events = classItem.events || [];
              const upcomingItems = [...assignments, ...events]
                .sort((a, b) => {
                  const dateA = new Date(a.dueDate || a.startDate);
                  const dateB = new Date(b.dueDate || b.startDate);
                  return dateA - dateB;
                })
                .slice(0, 3);

              return (
                <div
                  key={classItem.Id}
                  className="border border-surface-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full bg-${getSubjectColor(classItem.subject)}-500`}></div>
                    <h4 className="font-medium text-sm text-surface-900 truncate">
                      {classItem.name}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {upcomingItems.length === 0 ? (
                      <p className="text-xs text-surface-500 text-center py-2">
                        No upcoming items
                      </p>
                    ) : (
                      upcomingItems.map((item, index) => {
                        const isAssignment = 'dueDate' in item;
                        const date = new Date(item.dueDate || item.startDate);
                        const isOverdue = isAssignment && date < new Date();
                        
                        return (
                          <div
                            key={`${isAssignment ? 'assignment' : 'event'}-${item.Id}`}
                            className={`text-xs p-2 rounded border-l-2 cursor-pointer hover:bg-surface-50 ${
                              isOverdue
                                ? 'border-l-accent-500 bg-accent-50'
                                : isAssignment
                                ? 'border-l-warning-500 bg-warning-50'
                                : 'border-l-primary-500 bg-primary-50'
                            }`}
                            onClick={() => {
                              // Handle drill-down to assignment/event details
                              toast.info(`Viewing details for: ${item.title}`);
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <ApperIcon 
                                name={isAssignment ? "FileText" : "Calendar"} 
                                size={10} 
                                className={
                                  isOverdue
                                    ? 'text-accent-600'
                                    : isAssignment
                                    ? 'text-warning-600'
                                    : 'text-primary-600'
                                }
                              />
                              <span className={`font-medium ${
                                isOverdue
                                  ? 'text-accent-700'
                                  : isAssignment
                                  ? 'text-warning-700'
                                  : 'text-primary-700'
                              }`}>
                                {item.title}
                              </span>
                            </div>
                            <p className="text-surface-600 text-xs mb-1 truncate">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${
                                isOverdue ? 'text-accent-600 font-medium' : 'text-surface-500'
                              }`}>
                                {isAssignment ? 'Due' : 'Event'}: {date.toLocaleDateString()}
                              </span>
                              {isOverdue && (
                                <Badge variant="danger" size="xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
  );
};

export default Classes;