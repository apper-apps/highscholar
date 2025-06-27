import gradesData from '../mockData/grades.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let grades = [...gradesData];

export const gradeService = {
  async getAll() {
    await delay(300);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id, 10));
    if (!grade) {
      throw new Error('Grade not found');
    }
    return { ...grade };
  },

  async getByStudent(studentId) {
    await delay(200);
    return grades.filter(g => g.studentId === parseInt(studentId, 10));
  },

  async getByClass(classId) {
    await delay(200);
    return grades.filter(g => g.classId === parseInt(classId, 10));
  },

  async create(gradeData) {
    await delay(400);
    const maxId = Math.max(...grades.map(g => g.Id), 0);
    const newGrade = {
      Id: maxId + 1,
      date: new Date().toISOString().split('T')[0],
      ...gradeData
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, gradeData) {
    await delay(400);
    const index = grades.findIndex(g => g.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Grade not found');
    }
    
    const { Id, ...updateData } = gradeData;
    grades[index] = { ...grades[index], ...updateData };
    return { ...grades[index] };
  },

  async delete(id) {
    await delay(300);
    const index = grades.findIndex(g => g.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Grade not found');
    }
    
    const deletedGrade = grades[index];
    grades.splice(index, 1);
    return { ...deletedGrade };
  },

  async calculateAverage(studentId, classId = null) {
    await delay(200);
    let studentGrades = grades.filter(g => g.studentId === parseInt(studentId, 10));
    
    if (classId) {
      studentGrades = studentGrades.filter(g => g.classId === parseInt(classId, 10));
    }
    
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, grade) => {
      return sum + (grade.score / grade.maxScore) * 100;
    }, 0);
    
    return Math.round(total / studentGrades.length);
  }
};

export default gradeService;