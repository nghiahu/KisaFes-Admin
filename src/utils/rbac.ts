// Frontend Role type — matches backend role names after stripping "ROLE_" prefix
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'USER';

export type Permission = 
  | 'USER_VIEW'
  | 'USER_EDIT'
  | 'USER_DELETE'
  | 'CATEGORY_VIEW'
  | 'CATEGORY_EDIT'
  | 'CATEGORY_DELETE'
  | 'BLOG_VIEW'
  | 'BLOG_EDIT'
  | 'BLOG_DELETE'
  | 'BLOG_PUBLISH'
  | 'SETTINGS_VIEW'
  | 'SETTINGS_EDIT'
  | 'ANALYTICS_VIEW'
  | 'AUDIT_LOG_VIEW';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'USER_VIEW', 'USER_EDIT', 'USER_DELETE',
    'CATEGORY_VIEW', 'CATEGORY_EDIT', 'CATEGORY_DELETE',
    'BLOG_VIEW', 'BLOG_EDIT', 'BLOG_DELETE', 'BLOG_PUBLISH',
    'SETTINGS_VIEW', 'SETTINGS_EDIT',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW'
  ],
  ADMIN: [
    'USER_VIEW', 'USER_EDIT', 
    'CATEGORY_VIEW', 'CATEGORY_EDIT',
    'BLOG_VIEW', 'BLOG_EDIT', 'BLOG_PUBLISH',
    'SETTINGS_VIEW',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW'
  ],
  CONTENT_MANAGER: [
    'CATEGORY_VIEW',
    'BLOG_VIEW', 'BLOG_EDIT', 'BLOG_DELETE', 'BLOG_PUBLISH',
    'ANALYTICS_VIEW'
  ],
  MODERATOR: [
    'USER_VIEW',
    'BLOG_VIEW'
  ],
  USER: [] // standard users have no admin permissions
};

export const hasPermission = (userRole: string | undefined, permission: Permission): boolean => {
  if (!userRole) return false;
  // Normalize — strip ROLE_ prefix, convert to uppercase, replace spaces with underscores
  const normalized = userRole.replace(/^ROLE_/, '').toUpperCase().replace(/\s+/g, '_');
  const permissions = ROLE_PERMISSIONS[normalized] || [];
  return permissions.includes(permission);
};
