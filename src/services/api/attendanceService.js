import attendanceData from '../mockData/attendance.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let attendance = [...attendanceData];

export const attendanceService = {
  async getAll() {
    await delay(300);
    return [...attendance];
  },

  async getById(id) {
    await delay(200);
    const record = attendance.find(a => a.Id === parseInt(id, 10));
    if (!record) {
      throw new Error('Attendance record not found');
    }
    return { ...record };
  },

  async getByStudent(studentId) {
    await delay(200);
    return attendance.filter(a => a.studentId === parseInt(studentId, 10));
  },

  async getByClass(classId) {
    await delay(200);
    return attendance.filter(a => a.classId === parseInt(classId, 10));
  },

  async getByDate(date) {
    await delay(200);
    return attendance.filter(a => a.date === date);
  },

  async create(attendanceData) {
    await delay(400);
    const maxId = Math.max(...attendance.map(a => a.Id), 0);
    const newRecord = {
      Id: maxId + 1,
      ...attendanceData
    };
    attendance.push(newRecord);
    return { ...newRecord };
  },

  async update(id, attendanceData) {
    await delay(400);
    const index = attendance.findIndex(a => a.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Attendance record not found');
    }
    
    const { Id, ...updateData } = attendanceData;
    attendance[index] = { ...attendance[index], ...updateData };
    return { ...attendance[index] };
  },

  async delete(id) {
    await delay(300);
    const index = attendance.findIndex(a => a.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Attendance record not found');
    }
    
    const deletedRecord = attendance[index];
    attendance.splice(index, 1);
    return { ...deletedRecord };
  },

  async bulkUpdate(records) {
    await delay(500);
    const updatedRecords = [];
    
    for (const record of records) {
      const existingIndex = attendance.findIndex(a => 
        a.studentId === record.studentId && 
        a.classId === record.classId && 
        a.date === record.date
      );
      
      if (existingIndex !== -1) {
        attendance[existingIndex] = { ...attendance[existingIndex], ...record };
        updatedRecords.push({ ...attendance[existingIndex] });
      } else {
        const maxId = Math.max(...attendance.map(a => a.Id), 0);
        const newRecord = {
          Id: maxId + 1,
          ...record
        };
        attendance.push(newRecord);
        updatedRecords.push({ ...newRecord });
      }
    }
    
    return updatedRecords;
  },

  async getAttendanceRate(studentId, startDate = null, endDate = null) {
    await delay(200);
    let studentAttendance = attendance.filter(a => a.studentId === parseInt(studentId, 10));
    
    if (startDate && endDate) {
      studentAttendance = studentAttendance.filter(a => 
        a.date >= startDate && a.date <= endDate
      );
    }
    
    if (studentAttendance.length === 0) return 100;
    
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  }
};

export default attendanceService;