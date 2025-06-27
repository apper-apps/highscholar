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
  }
};

export default classService;