import classesData from '../mockData/classes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract all assignments from classes data
let assignments = classesData.flatMap(classItem => 
  (classItem.assignments || []).map(assignment => ({
    ...assignment,
    className: classItem.name,
    classSubject: classItem.subject
  }))
);

export const assignmentService = {
  async getAll() {
    await delay(300);
    return [...assignments];
  },

  async getById(id) {
    await delay(200);
    const assignment = assignments.find(a => a.Id === parseInt(id, 10));
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return { ...assignment };
  },

  async create(assignmentData) {
    await delay(400);
    const maxId = Math.max(...assignments.map(a => a.Id), 0);
    const newAssignment = {
      Id: maxId + 1,
      ...assignmentData,
      classId: parseInt(assignmentData.classId, 10)
    };
    
    // Find class to get name and subject
    const classItem = classesData.find(c => c.Id === newAssignment.classId);
    if (classItem) {
      newAssignment.className = classItem.name;
      newAssignment.classSubject = classItem.subject;
    }
    
    assignments.push(newAssignment);
    return { ...newAssignment };
  },

  async update(id, assignmentData) {
    await delay(400);
    const index = assignments.findIndex(a => a.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Assignment not found');
    }
    
    const { Id, ...updateData } = assignmentData;
    assignments[index] = { ...assignments[index], ...updateData };
    
    // Update class info if classId changed
    if (updateData.classId) {
      const classItem = classesData.find(c => c.Id === parseInt(updateData.classId, 10));
      if (classItem) {
        assignments[index].className = classItem.name;
        assignments[index].classSubject = classItem.subject;
      }
    }
    
    return { ...assignments[index] };
  },

  async delete(id) {
    await delay(300);
    const index = assignments.findIndex(a => a.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Assignment not found');
    }
    
    const deletedAssignment = assignments[index];
    assignments.splice(index, 1);
    return { ...deletedAssignment };
  },

  async getByClass(classId) {
    await delay(200);
    const classAssignments = assignments.filter(a => a.classId === parseInt(classId, 10));
    return [...classAssignments];
  }
};

export default assignmentService;