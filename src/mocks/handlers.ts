import { http, HttpResponse } from 'msw';
import type { Role } from '../utils/rbac';

export type UserStatus = 'ACTIVE' | 'BANNED' | 'INACTIVE';

export interface UserMock {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  joinedAt: string;
}

// In-memory mock database
let users: UserMock[] = [
  { id: '1', fullName: 'John Doe', email: 'john@example.com', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2023-01-15T10:00:00Z' },
  { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', role: 'CONTENT_MANAGER', status: 'ACTIVE', joinedAt: '2023-02-20T14:30:00Z' },
  { id: '3', fullName: 'Alice Johnson', email: 'alice@example.com', role: 'MODERATOR', status: 'ACTIVE', joinedAt: '2023-03-05T09:15:00Z' },
  { id: '4', fullName: 'Bob Williams', email: 'bob@example.com', role: 'SUPER_ADMIN', status: 'BANNED', joinedAt: '2022-11-10T11:20:00Z' },
  { id: '5', fullName: 'Charlie Brown', email: 'charlie@example.com', role: 'MODERATOR', status: 'INACTIVE', joinedAt: '2024-01-02T08:45:00Z' },
  ...Array.from({ length: 45 }).map((_, i) => ({
    id: `u-${i + 6}`,
    fullName: `Random User ${i + 6}`,
    email: `user${i + 6}@example.com`,
    role: 'MODERATOR' as Role,
    status: (i % 5 === 0 ? 'BANNED' : 'ACTIVE') as UserStatus,
    joinedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
  }))
];

let categories = [
  {
    id: 'c1',
    name: 'Software',
    description: 'Template for software development projects.',
    defaultFlow: ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'],
    defaultIssueTypes: ['Story', 'Task', 'Bug', 'Epic', 'Subtask'],
    defaultLabels: ['frontend', 'backend', 'design', 'urgent'],
  },
  {
    id: 'c2',
    name: 'Marketing',
    description: 'Template for marketing campaigns and tasks.',
    defaultFlow: ['Ideas', 'Planning', 'Content', 'Published'],
    defaultIssueTypes: ['Campaign', 'Asset', 'Task'],
    defaultLabels: ['social media', 'blog', 'ad', 'urgent'],
  }
];

export type BlogStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';

let blogs = Array.from({ length: 25 }).map((_, i) => ({
  id: `b${i + 1}`,
  title: `The Future of Project Management ${i + 1}`,
  excerpt: `Exploring new trends in team collaboration and agile workflows ${i + 1}.`,
  content: `This is the full content of the blog post ${i + 1}. It goes into detail about how KisaFres helps teams.`,
  authorId: `u-${(i % 5) + 1}`,
  authorName: `Author Name ${i + 1}`,
  status: (i % 4 === 0 ? 'DRAFT' : i % 3 === 0 ? 'PENDING' : i % 5 === 0 ? 'ARCHIVED' : 'PUBLISHED') as BlogStatus,
  tags: ['agile', 'productivity'],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
  views: Math.floor(Math.random() * 1000)
}));

let settingsData = {
  companyName: 'KisaFres Inc.',
  supportEmail: 'support@kisafres.com',
  allowRegistration: true,
  maintenanceMode: false,
  maxUploadSizeMB: 50
};

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';

const ACTIONS: AuditActionType[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'OTHER'];
const ENTITIES = ['USER', 'PROJECT', 'BLOG', 'CATEGORY', 'SYSTEM'];

let auditLogs = Array.from({ length: 150 }).map((_, i) => ({
  id: `log-${i + 1}`,
  userId: `u-${(i % 10) + 1}`,
  userName: `Admin User ${(i % 5) + 1}`,
  userEmail: `admin${(i % 5) + 1}@kisafres.com`,
  action: ACTIONS[i % ACTIONS.length],
  entity: ENTITIES[i % ENTITIES.length],
  entityId: `entity-${Math.floor(Math.random() * 100)}`,
  details: `Performed ${ACTIONS[i % ACTIONS.length]} on ${ENTITIES[i % ENTITIES.length]}`,
  ipAddress: `192.168.1.${(i % 255) + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
})).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

let systemNotifications = [
  {
    id: 'n1',
    title: 'Scheduled Maintenance',
    message: 'The system will go down for maintenance at 2 AM UTC this Sunday.',
    type: 'WARNING',
    targetAudience: 'ALL',
    sentBy: 'System Admin',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'n2',
    title: 'New Feature Release',
    message: 'We just launched the new Analytics Dashboard! Check it out.',
    type: 'INFO',
    targetAudience: 'ADMINS',
    sentBy: 'Product Team',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const handlers = [
  // Authentication
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: {
        id: '1',
        email: 'admin@kisafres.com',
        fullName: 'System Admin',
        role: 'SUPER_ADMIN',
      }
    });
  }),
  
  // Get Users with Pagination & Search
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredUsers = users;
    if (search) {
      filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }

    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return HttpResponse.json({
      data: paginatedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }),

  // Get User Detail
  http.get('/api/admin/users/:id', ({ params }) => {
    const user = users.find(u => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    
    // Mocking detailed data
    return HttpResponse.json({
      ...user,
      stats: {
        projectsJoined: Math.floor(Math.random() * 10),
        pendingTasks: Math.floor(Math.random() * 50),
        blogsWritten: Math.floor(Math.random() * 5),
      },
      auditLogs: [
        { id: 1, action: 'Promoted to Admin', performedBy: 'System Admin', date: new Date().toISOString() },
        { id: 2, action: 'Updated profile picture', performedBy: 'Self', date: new Date(Date.now() - 86400000).toISOString() }
      ]
    });
  }),

  // Bulk Actions
  http.post('/api/admin/users/bulk-action', async ({ request }) => {
    const { action, userIds } = await request.json() as { action: 'ban' | 'activate' | 'delete', userIds: string[] };
    
    if (action === 'delete') {
      users = users.filter(u => !userIds.includes(u.id));
    } else if (action === 'ban') {
      users = users.map(u => userIds.includes(u.id) ? { ...u, status: 'BANNED' } : u);
    } else if (action === 'activate') {
      users = users.map(u => userIds.includes(u.id) ? { ...u, status: 'ACTIVE' } : u);
    }

    return HttpResponse.json({ success: true });
  }),

  // Change Role
  http.patch('/api/admin/users/:id/role', async ({ request, params }) => {
    const { role } = await request.json() as { role: Role };
    users = users.map(u => u.id === params.id ? { ...u, role } : u);
    return HttpResponse.json({ success: true });
  }),

  // Categories
  http.get('/api/admin/categories', () => {
    return HttpResponse.json(categories);
  }),
  http.post('/api/admin/categories', async ({ request }) => {
    const data = await request.json() as any;
    const newCategory = { ...data, id: Date.now().toString() };
    categories.push(newCategory);
    return HttpResponse.json(newCategory);
  }),
  http.put('/api/admin/categories/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    categories = categories.map(c => c.id === params.id ? { ...c, ...data } : c);
    return HttpResponse.json(categories.find(c => c.id === params.id));
  }),
  http.delete('/api/admin/categories/:id', ({ params }) => {
    categories = categories.filter(c => c.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Blogs
  http.get('/api/admin/blogs', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const statusFilter = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredBlogs = blogs;
    if (search) {
      filteredBlogs = filteredBlogs.filter(b => b.title.toLowerCase().includes(search));
    }
    if (statusFilter) {
      filteredBlogs = filteredBlogs.filter(b => b.status === statusFilter);
    }

    const total = filteredBlogs.length;
    const start = (page - 1) * limit;
    const paginatedBlogs = filteredBlogs.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedBlogs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  }),
  http.get('/api/admin/blogs/:id', ({ params }) => {
    const blog = blogs.find(b => b.id === params.id);
    return blog ? HttpResponse.json(blog) : new HttpResponse(null, { status: 404 });
  }),
  http.post('/api/admin/blogs', async ({ request }) => {
    const data = await request.json() as any;
    const newBlog = {
      ...data,
      id: Date.now().toString(),
      authorId: '1',
      authorName: 'System Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
    blogs.unshift(newBlog);
    return HttpResponse.json(newBlog);
  }),
  http.put('/api/admin/blogs/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    blogs = blogs.map(b => b.id === params.id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b);
    return HttpResponse.json(blogs.find(b => b.id === params.id));
  }),
  http.patch('/api/admin/blogs/:id/status', async ({ request, params }) => {
    const { status } = await request.json() as { status: any };
    blogs = blogs.map(b => b.id === params.id ? { ...b, status, updatedAt: new Date().toISOString() } : b);
    return HttpResponse.json({ success: true });
  }),
  http.delete('/api/admin/blogs/:id', ({ params }) => {
    blogs = blogs.filter(b => b.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Settings
  http.get('/api/admin/settings', () => {
    return HttpResponse.json(settingsData);
  }),
  http.put('/api/admin/settings', async ({ request }) => {
    const data = await request.json() as any;
    settingsData = { ...settingsData, ...data };
    return HttpResponse.json(settingsData);
  }),

  // Analytics
  http.get('/api/admin/analytics', () => {
    return HttpResponse.json({
      userTrends: [
        { month: 'Jan', users: 400 },
        { month: 'Feb', users: 600 },
        { month: 'Mar', users: 800 },
        { month: 'Apr', users: 1100 },
        { month: 'May', users: 1500 },
        { month: 'Jun', users: 2100 },
      ],
      projectsByCategory: [
        { name: 'Software', value: 45 },
        { name: 'Marketing', value: 25 },
        { name: 'Design', value: 15 },
        { name: 'HR', value: 10 },
        { name: 'Other', value: 5 },
      ],
      taskStatus: [
        { name: 'Week 1', completed: 120, pending: 45 },
        { name: 'Week 2', completed: 150, pending: 60 },
        { name: 'Week 3', completed: 180, pending: 50 },
        { name: 'Week 4', completed: 210, pending: 30 },
      ]
    });
  }),

  // Audit Logs
  http.get('/api/admin/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const actionFilter = url.searchParams.get('action');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let filteredLogs = auditLogs;
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.userName.toLowerCase().includes(search) || 
        log.userEmail.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search)
      );
    }
    if (actionFilter) {
      filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
    }

    const total = filteredLogs.length;
    const start = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedLogs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  }),

  // Notifications
  http.get('/api/admin/notifications', () => {
    return HttpResponse.json(systemNotifications);
  }),
  http.post('/api/admin/notifications/broadcast', async ({ request }) => {
    const data = await request.json() as any;
    const newNotification = {
      ...data,
      id: Date.now().toString(),
      sentBy: 'System Admin',
      createdAt: new Date().toISOString()
    };
    systemNotifications.unshift(newNotification);
    return HttpResponse.json(newNotification);
  }),
  http.delete('/api/admin/notifications/:id', ({ params }) => {
    systemNotifications = systemNotifications.filter(n => n.id !== params.id);
    return HttpResponse.json({ success: true });
  })
];
