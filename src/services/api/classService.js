import classesData from '../mockData/classes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let classes = [...classesData];

export const classService = {
  async getAll() {
    await delay(300);
    return [...classes];
  },

  async getById(id) {
    await delay(200);
    const classItem = classes.find(c => c.Id === parseInt(id, 10));
    if (!classItem) {
      throw new Error('Class not found');
    }
    return { ...classItem };
  },

  async create(classData) {
    await delay(400);
    const maxId = Math.max(...classes.map(c => c.Id), 0);
    const newClass = {
      Id: maxId + 1,
      studentIds: [],
      ...classData
    };
    classes.push(newClass);
    return { ...newClass };
  },

  async update(id, classData) {
    await delay(400);
    const index = classes.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Class not found');
    }
    
    const { Id, ...updateData } = classData;
    classes[index] = { ...classes[index], ...updateData };
    return { ...classes[index] };
  },

  async delete(id) {
    await delay(300);
    const index = classes.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Class not found');
    }
    
    const deletedClass = classes[index];
    classes.splice(index, 1);
    return { ...deletedClass };
  },

  async addStudent(classId, studentId) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }
    
    if (!classes[classIndex].studentIds.includes(parseInt(studentId, 10))) {
      classes[classIndex].studentIds.push(parseInt(studentId, 10));
    }
    
    return { ...classes[classIndex] };
  },

  async removeStudent(classId, studentId) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }
    
    classes[classIndex].studentIds = classes[classIndex].studentIds.filter(
      id => id !== parseInt(studentId, 10)
    );
return { ...classes[classIndex] };
  },

  async getAssignments(classId) {
    await delay(200);
    const classItem = classes.find(c => c.Id === parseInt(classId, 10));
    if (!classItem) {
      throw new Error('Class not found');
    }
    return [...(classItem.assignments || [])];
  },

  async getEvents(classId) {
    await delay(200);
    const classItem = classes.find(c => c.Id === parseInt(classId, 10));
    if (!classItem) {
      throw new Error('Class not found');
    }
    return [...(classItem.events || [])];
  },

  async addAssignment(classId, assignment) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    if (!classes[classIndex].assignments) {
      classes[classIndex].assignments = [];
    }

    const maxId = Math.max(
      ...classes.flatMap(c => c.assignments || []).map(a => a.Id),
      0
    );

    const newAssignment = {
      Id: maxId + 1,
      classId: parseInt(classId, 10),
      ...assignment
    };

    classes[classIndex].assignments.push(newAssignment);
    return { ...newAssignment };
  },

  async updateAssignment(classId, assignmentId, assignmentData) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    const assignments = classes[classIndex].assignments || [];
    const assignmentIndex = assignments.findIndex(a => a.Id === parseInt(assignmentId, 10));
    if (assignmentIndex === -1) {
      throw new Error('Assignment not found');
    }

    const { Id, ...updateData } = assignmentData;
    classes[classIndex].assignments[assignmentIndex] = {
      ...classes[classIndex].assignments[assignmentIndex],
      ...updateData
    };

    return { ...classes[classIndex].assignments[assignmentIndex] };
  },

  async deleteAssignment(classId, assignmentId) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    const assignments = classes[classIndex].assignments || [];
    const assignmentIndex = assignments.findIndex(a => a.Id === parseInt(assignmentId, 10));
    if (assignmentIndex === -1) {
      throw new Error('Assignment not found');
    }

    const deletedAssignment = classes[classIndex].assignments[assignmentIndex];
    classes[classIndex].assignments.splice(assignmentIndex, 1);
    return { ...deletedAssignment };
  },

  async addEvent(classId, event) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    if (!classes[classIndex].events) {
      classes[classIndex].events = [];
    }

    const maxId = Math.max(
      ...classes.flatMap(c => c.events || []).map(e => e.Id),
      0
    );

    const newEvent = {
      Id: maxId + 1,
      classId: parseInt(classId, 10),
      ...event
    };

    classes[classIndex].events.push(newEvent);
    return { ...newEvent };
  },

  async updateEvent(classId, eventId, eventData) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    const events = classes[classIndex].events || [];
    const eventIndex = events.findIndex(e => e.Id === parseInt(eventId, 10));
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const { Id, ...updateData } = eventData;
    classes[classIndex].events[eventIndex] = {
      ...classes[classIndex].events[eventIndex],
      ...updateData
    };

    return { ...classes[classIndex].events[eventIndex] };
  },

  async deleteEvent(classId, eventId) {
    await delay(300);
    const classIndex = classes.findIndex(c => c.Id === parseInt(classId, 10));
    if (classIndex === -1) {
      throw new Error('Class not found');
    }

    const events = classes[classIndex].events || [];
    const eventIndex = events.findIndex(e => e.Id === parseInt(eventId, 10));
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const deletedEvent = classes[classIndex].events[eventIndex];
    classes[classIndex].events.splice(eventIndex, 1);
    return { ...deletedEvent };
  }
};

export default classService;