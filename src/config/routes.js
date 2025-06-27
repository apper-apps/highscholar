import Dashboard from '@/components/pages/Dashboard';
import Students from '@/components/pages/Students';
import Classes from '@/components/pages/Classes';
import Grades from '@/components/pages/Grades';
import Attendance from '@/components/pages/Attendance';
import Reports from '@/components/pages/Reports';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  students: {
    id: 'students',
    label: 'Students',
    path: '/students',
    icon: 'Users',
    component: Students
  },
  classes: {
    id: 'classes',
    label: 'Classes',
    path: '/classes',
    icon: 'BookOpen',
    component: Classes
  },
  grades: {
    id: 'grades',
    label: 'Grades',
    path: '/grades',
    icon: 'Award',
    component: Grades
  },
  attendance: {
    id: 'attendance',
    label: 'Attendance',
    path: '/attendance',
    icon: 'CheckSquare',
    component: Attendance
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'FileText',
    component: Reports
  }
};

export const routeArray = Object.values(routes);
export default routes;