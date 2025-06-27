import { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import { SkeletonLoader } from '@/components/organisms/LoadingStates';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import classService from '@/services/api/classService';
import assignmentService from '@/services/api/assignmentService';
import eventService from '@/services/api/eventService';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'meeting',
    classId: ''
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'homework',
    classId: ''
  });
  const [calendarView, setCalendarView] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesData, assignmentsData, eventsData] = await Promise.all([
        classService.getAll(),
        assignmentService.getAll(),
        eventService.getAll()
      ]);
      
      setClasses(classesData);
      setAssignments(assignmentsData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents = useMemo(() => {
    let allEvents = [];

    // Add assignments as events
    const assignmentEvents = assignments
      .filter(assignment => selectedClass === 'all' || assignment.classId === parseInt(selectedClass))
      .map(assignment => ({
        id: `assignment-${assignment.Id}`,
        title: `📝 ${assignment.title}`,
        start: new Date(assignment.dueDate),
        end: new Date(assignment.dueDate),
        resource: { ...assignment, type: 'assignment' },
        className: 'assignment-event'
      }));

    // Add events
    const calendarEventItems = events
      .filter(event => selectedClass === 'all' || event.classId === parseInt(selectedClass))
      .map(event => ({
        id: `event-${event.Id}`,
        title: `📅 ${event.title}`,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        resource: { ...event, type: 'event' },
        className: 'calendar-event'
      }));

    allEvents = [...assignmentEvents, ...calendarEventItems];
    return allEvents;
  }, [assignments, events, selectedClass]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event.resource);
    if (event.resource.type === 'assignment') {
      setShowAssignmentModal(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'meeting',
      classId: ''
    });
    setShowEventModal(true);
  };

  const handleCreateAssignment = () => {
    setSelectedEvent(null);
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      type: 'homework',
      classId: ''
    });
    setShowAssignmentModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEvent && selectedEvent.type === 'event') {
        await eventService.update(selectedEvent.Id, eventForm);
        toast.success('Event updated successfully');
      } else {
        await eventService.create(eventForm);
        toast.success('Event created successfully');
      }
      
      setShowEventModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEvent && selectedEvent.type === 'assignment') {
        await assignmentService.update(selectedEvent.Id, assignmentForm);
        toast.success('Assignment updated successfully');
      } else {
        await assignmentService.create(assignmentForm);
        toast.success('Assignment created successfully');
      }
      
      setShowAssignmentModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save assignment');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        if (selectedEvent.type === 'assignment') {
          await assignmentService.delete(selectedEvent.Id);
          toast.success('Assignment deleted successfully');
        } else {
          await eventService.delete(selectedEvent.Id);
          toast.success('Event deleted successfully');
        }
        
        setShowEventModal(false);
        setShowAssignmentModal(false);
        loadData();
      } catch (err) {
        toast.error(err.message || 'Failed to delete item');
      }
    }
  };

  const getClassOptions = () => [
    { value: 'all', label: 'All Classes' },
    ...classes.map(cls => ({ value: cls.Id.toString(), label: cls.name }))
  ];

  const eventTypeOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'fieldtrip', label: 'Field Trip' },
    { value: 'activity', label: 'Activity' }
  ];

  const assignmentTypeOptions = [
    { value: 'homework', label: 'Homework' },
    { value: 'exam', label: 'Exam' },
    { value: 'essay', label: 'Essay' },
    { value: 'lab', label: 'Lab Report' },
    { value: 'project', label: 'Project' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={3} />
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
              Class Calendar
            </h3>
            <p className="text-sm text-surface-600">
              Manage assignments, events, and important dates
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              options={getClassOptions()}
              placeholder="Filter by class"
              className="w-48"
            />
            <Button onClick={handleCreateEvent}>
              <ApperIcon name="Plus" size={14} />
              Add Event
            </Button>
            <Button variant="outline" onClick={handleCreateAssignment}>
              <ApperIcon name="FileText" size={14} />
              Add Assignment
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card>
        <div className="h-96 md:h-[600px]">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventSelect}
            view={calendarView}
            onView={setCalendarView}
            views={['month', 'week', 'day', 'agenda']}
            popup
            eventPropGetter={(event) => ({
              className: event.resource.type === 'assignment' ? 'assignment-event' : 'calendar-event',
              style: {
                backgroundColor: event.resource.type === 'assignment' ? '#f59e0b' : '#3b82f6',
                borderColor: event.resource.type === 'assignment' ? '#d97706' : '#2563eb',
                color: 'white'
              }
            })}
          />
        </div>
      </Card>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-surface-400 hover:text-surface-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <FormField label="Event Title" required>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Input
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </FormField>

                <FormField label="Class" required>
                  <Select
                    value={eventForm.classId}
                    onChange={(value) => setEventForm(prev => ({ ...prev, classId: value }))}
                    options={classes.map(cls => ({ value: cls.Id.toString(), label: cls.name }))}
                    placeholder="Select class"
                    required
                  />
                </FormField>

                <FormField label="Event Type" required>
                  <Select
                    value={eventForm.type}
                    onChange={(value) => setEventForm(prev => ({ ...prev, type: value }))}
                    options={eventTypeOptions}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start Date" required>
                    <Input
                      type="datetime-local"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </FormField>

                  <FormField label="End Date" required>
                    <Input
                      type="datetime-local"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </FormField>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {selectedEvent ? 'Update' : 'Create'} Event
                  </Button>
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDeleteEvent}
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedEvent ? 'Assignment Details' : 'Create Assignment'}
                </h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-surface-400 hover:text-surface-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <FormField label="Assignment Title" required>
                  <Input
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Input
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </FormField>

                <FormField label="Class" required>
                  <Select
                    value={assignmentForm.classId}
                    onChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}
                    options={classes.map(cls => ({ value: cls.Id.toString(), label: cls.name }))}
                    placeholder="Select class"
                    required
                  />
                </FormField>

                <FormField label="Assignment Type" required>
                  <Select
                    value={assignmentForm.type}
                    onChange={(value) => setAssignmentForm(prev => ({ ...prev, type: value }))}
                    options={assignmentTypeOptions}
                    required
                  />
                </FormField>

                <FormField label="Due Date" required>
                  <Input
                    type="datetime-local"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </FormField>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {selectedEvent ? 'Update' : 'Create'} Assignment
                  </Button>
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDeleteEvent}
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAssignmentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Calendar;