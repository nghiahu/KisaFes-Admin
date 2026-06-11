export const PERMISSION_GROUPS = [
  {
    name: 'Dự án',
    permissions: [
      { id: 'PROJECT_VIEW', label: 'Xem dự án' },
      { id: 'PROJECT_UPDATE', label: 'Cập nhật dự án' },
      { id: 'PROJECT_CREATE', label: 'Tạo dự án' },
      { id: 'PROJECT_DELETE', label: 'Xóa dự án' },
      { id: 'PROJECT_ARCHIVE', label: 'Lưu trữ dự án' },
    ]
  },
  {
    name: 'Công việc',
    permissions: [
      { id: 'TASK_VIEW', label: 'Xem công việc' },
      { id: 'TASK_CREATE', label: 'Tạo công việc' },
      { id: 'TASK_UPDATE', label: 'Sửa công việc' },
      { id: 'TASK_DELETE', label: 'Xóa công việc' },
      { id: 'TASK_ASSIGN', label: 'Giao việc' },
      { id: 'TASK_CHANGE_STATUS', label: 'Đổi trạng thái' },
    ]
  },
  {
    name: 'Bảng (Board)',
    permissions: [
      { id: 'BOARD_VIEW', label: 'Xem bảng' },
      { id: 'BOARD_UPDATE', label: 'Cấu hình bảng' },
    ]
  },
  {
    name: 'Thành viên',
    permissions: [
      { id: 'MEMBER_INVITE', label: 'Mời thành viên' },
      { id: 'MEMBER_REMOVE', label: 'Xóa thành viên' },
      { id: 'MEMBER_UPDATE_ROLE', label: 'Đổi quyền thành viên' },
    ]
  },
  {
    name: 'Bình luận & Đính kèm',
    permissions: [
      { id: 'COMMENT_CREATE', label: 'Tạo bình luận' },
      { id: 'COMMENT_UPDATE', label: 'Sửa bình luận' },
      { id: 'COMMENT_DELETE', label: 'Xóa bình luận' },
      { id: 'ATTACHMENT_UPLOAD', label: 'Tải file' },
      { id: 'ATTACHMENT_DELETE', label: 'Xóa file' },
    ]
  },
  {
    name: 'Phân quyền',
    permissions: [
      { id: 'ROLE_MANAGE', label: 'Quản lý Role' },
      { id: 'PERMISSION_MANAGE', label: 'Quản lý Phân quyền' },
    ]
  }
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id));
