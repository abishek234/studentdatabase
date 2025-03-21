// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

export const getNavConfig = (userRole) =>{
  const navConfig = [];

  if (userRole === 'admin') {
    navConfig.push(
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
  {
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'student',
    path: '/dashboard/student',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'profile',
    path: '/dashboard/profile',
    icon: getIcon('eva:person-fill'),
  },
    );
  } else if (userRole === 'staff') {
    navConfig.push(
  
    {
      title: 'dashboard',
      path: '/dashboard/app',
      icon: getIcon('eva:pie-chart-2-fill'),
    },

    {
      title: 'student',
      path: '/dashboard/student',
      icon: getIcon('eva:people-fill'),
    },
    {
      title: 'profile',
      path: '/dashboard/profile',
      icon: getIcon('eva:person-fill'),
    },
  
    );
  
  } else if (userRole === 'student') {

    navConfig.push(
  {
    title: 'profile check',
    path: '/dashboard/student-profile',
    icon: getIcon('eva:person-fill'),
  },
  {
    title: 'change request',  
    path: '/dashboard/student-change-form',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'profile',
    path: '/dashboard/profile',
    icon: getIcon('eva:person-fill'),
  },

  );
} 
return navConfig;
}