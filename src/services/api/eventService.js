import classesData from '../mockData/classes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract all events from classes data
let events = classesData.flatMap(classItem => 
  (classItem.events || []).map(event => ({
    ...event,
    className: classItem.name,
    classSubject: classItem.subject
  }))
);

export const eventService = {
  async getAll() {
    await delay(300);
    return [...events];
  },

  async getById(id) {
    await delay(200);
    const event = events.find(e => e.Id === parseInt(id, 10));
    if (!event) {
      throw new Error('Event not found');
    }
    return { ...event };
  },

  async create(eventData) {
    await delay(400);
    const maxId = Math.max(...events.map(e => e.Id), 0);
    const newEvent = {
      Id: maxId + 1,
      ...eventData,
      classId: parseInt(eventData.classId, 10)
    };
    
    // Find class to get name and subject
    const classItem = classesData.find(c => c.Id === newEvent.classId);
    if (classItem) {
      newEvent.className = classItem.name;
      newEvent.classSubject = classItem.subject;
    }
    
    events.push(newEvent);
    return { ...newEvent };
  },

  async update(id, eventData) {
    await delay(400);
    const index = events.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    const { Id, ...updateData } = eventData;
    events[index] = { ...events[index], ...updateData };
    
    // Update class info if classId changed
    if (updateData.classId) {
      const classItem = classesData.find(c => c.Id === parseInt(updateData.classId, 10));
      if (classItem) {
        events[index].className = classItem.name;
        events[index].classSubject = classItem.subject;
      }
    }
    
    return { ...events[index] };
  },

  async delete(id) {
    await delay(300);
    const index = events.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    const deletedEvent = events[index];
    events.splice(index, 1);
    return { ...deletedEvent };
  }
};

export default eventService;