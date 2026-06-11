import { Label } from '@/components/ui/Label';
import { useState, useEffect } from 'react';
import { Icons } from '../../shared/assets/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableStatusItem from './components/SortableStatusItem';
import SortableColumnItem from './components/SortableColumnItem';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/textarea';
import type { CategoryEditorModalProps } from '../../types';

import { PERMISSION_GROUPS, ALL_PERMISSIONS } from '../../constants/permissions';
import { STATUS_COLORS } from '../../constants/theme';



export default function CategoryEditorModal({ category, isOpen, onClose, onSave, isSaving }: CategoryEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'statuses' | 'columns' | 'roles'>('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultStatuses: [] as any[],
    defaultBoardColumns: [] as any[],
    defaultRoles: [] as any[]
  });

  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (category) {
      let loadedRoles = category.defaultRoles ? [...category.defaultRoles] : [];
      // Ensure Owner role exists
      if (!loadedRoles.some(r => r.name.toLowerCase() === 'owner')) {
        loadedRoles = [{ id: 'owner', name: 'Owner', permissions: ALL_PERMISSIONS }, ...loadedRoles];
      }
      
      // Ensure columns have an 'id' for dnd-kit
      let loadedColumns = category.defaultBoardColumns ? [...category.defaultBoardColumns] : [];
      loadedColumns = loadedColumns.map((col, i) => ({ ...col, id: col.name + '_' + i }));

      setFormData({
        name: category.name || '',
        description: category.description || '',
        defaultStatuses: category.defaultStatuses ? [...category.defaultStatuses] : [],
        defaultBoardColumns: loadedColumns,
        defaultRoles: loadedRoles
      });
    } else {
      setFormData({
        name: '',
        description: '',
        defaultStatuses: [
          { statusId: 'todo', label: 'To Do', category: 'TO_DO', color: STATUS_COLORS.TODO },
          { statusId: 'in_progress', label: 'In Progress', category: 'IN_PROGRESS', color: STATUS_COLORS.IN_PROGRESS },
          { statusId: 'done', label: 'Done', category: 'DONE', color: STATUS_COLORS.DONE }
        ],
        defaultBoardColumns: [
          { id: 'col_1', name: 'To Do', mappedStatusIds: ['todo'], position: 0 },
          { id: 'col_2', name: 'In Progress', mappedStatusIds: ['in_progress'], position: 1 },
          { id: 'col_3', name: 'Done', mappedStatusIds: ['done'], position: 2 }
        ],
        defaultRoles: [
          { id: 'owner', name: 'Owner', permissions: ALL_PERMISSIONS }
        ]
      });
    }
    setActiveTab('basic');
    setActiveRoleIndex(0);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Tên template không được để trống");
      return;
    }
    
    // Clean up 'id' from columns before saving if needed, but backend will just ignore extra fields.
    const cleanColumns = formData.defaultBoardColumns.map((col, idx) => ({
      name: col.name,
      mappedStatusIds: col.mappedStatusIds,
      position: idx
    }));

    onSave({
      ...formData,
      defaultBoardColumns: cleanColumns
    });
  };

  // Status Handlers
  const addStatus = () => {
    setFormData(prev => ({
      ...prev,
      defaultStatuses: [...prev.defaultStatuses, { statusId: `status_${Date.now()}`, label: 'New Status', category: 'TO_DO', color: '#64748b' }]
    }));
  };
  const updateStatus = (index: number, key: string, value: string) => {
    const newStatuses = [...formData.defaultStatuses];
    newStatuses[index] = { ...newStatuses[index], [key]: value };
    setFormData(prev => ({ ...prev, defaultStatuses: newStatuses }));
  };
  const removeStatus = (index: number) => {
    const statusToRemove = formData.defaultStatuses[index].statusId;
    setFormData(prev => ({
      ...prev,
      defaultStatuses: prev.defaultStatuses.filter((_, i) => i !== index),
      defaultBoardColumns: prev.defaultBoardColumns.map(col => ({
        ...col,
        mappedStatusIds: col.mappedStatusIds.filter((id: string) => id !== statusToRemove)
      }))
    }));
  };

  // Column Handlers
  const addColumn = () => {
    setFormData(prev => ({
      ...prev,
      defaultBoardColumns: [...prev.defaultBoardColumns, { id: `col_${Date.now()}`, name: 'New Column', mappedStatusIds: [], position: prev.defaultBoardColumns.length }]
    }));
  };
  const updateColumn = (index: number, key: string, value: any) => {
    const newCols = [...formData.defaultBoardColumns];
    newCols[index] = { ...newCols[index], [key]: value };
    setFormData(prev => ({ ...prev, defaultBoardColumns: newCols }));
  };
  const toggleColumnStatus = (colIndex: number, statusId: string) => {
    let newCols = [...formData.defaultBoardColumns];
    const mapped = newCols[colIndex].mappedStatusIds || [];
    
    if (mapped.includes(statusId)) {
      // Remove it from this column
      newCols[colIndex].mappedStatusIds = mapped.filter((id: string) => id !== statusId);
    } else {
      // Add to this column, and remove from ALL other columns to enforce 1:1 mapping
      newCols = newCols.map((col, idx) => {
        if (idx === colIndex) {
          return { ...col, mappedStatusIds: [...(col.mappedStatusIds || []), statusId] };
        } else {
          return { ...col, mappedStatusIds: (col.mappedStatusIds || []).filter((id: string) => id !== statusId) };
        }
      });
    }
    setFormData(prev => ({ ...prev, defaultBoardColumns: newCols }));
  };
  const removeColumn = (index: number) => {
    setFormData(prev => {
      const filtered = prev.defaultBoardColumns.filter((_, i) => i !== index);
      const reordered = filtered.map((c, i) => ({ ...c, position: i }));
      return { ...prev, defaultBoardColumns: reordered };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.defaultBoardColumns.findIndex((col) => col.id === active.id);
        const newIndex = prev.defaultBoardColumns.findIndex((col) => col.id === over.id);
        
        const newCols = arrayMove(prev.defaultBoardColumns, oldIndex, newIndex);
        // Update positions
        const reordered = newCols.map((col, idx) => ({ ...col, position: idx }));
        return { ...prev, defaultBoardColumns: reordered };
      });
    }
  };

  const handleStatusDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.defaultStatuses.findIndex((status) => status.statusId === active.id);
        const newIndex = prev.defaultStatuses.findIndex((status) => status.statusId === over.id);
        
        const newStatuses = arrayMove(prev.defaultStatuses, oldIndex, newIndex);
        return { ...prev, defaultStatuses: newStatuses };
      });
    }
  };

  // Role Handlers
  const togglePermission = (roleIdx: number, permId: string) => {
    const role = formData.defaultRoles[roleIdx];
    if (role.name.toLowerCase() === 'owner' || role.id === 'owner') return; // Cannot edit owner
    
    const newRoles = [...formData.defaultRoles];
    const perms = newRoles[roleIdx].permissions || [];
    if (perms.includes(permId)) {
      newRoles[roleIdx].permissions = perms.filter((p: string) => p !== permId);
    } else {
      newRoles[roleIdx].permissions = [...perms, permId];
    }
    setFormData(prev => ({ ...prev, defaultRoles: newRoles }));
  };
  
  const toggleGroupPermissions = (roleIdx: number, groupPermIds: string[]) => {
    const role = formData.defaultRoles[roleIdx];
    if (role.name.toLowerCase() === 'owner' || role.id === 'owner') return; // Cannot edit owner

    const newRoles = [...formData.defaultRoles];
    const perms = newRoles[roleIdx].permissions || [];
    const allIncluded = groupPermIds.every(p => perms.includes(p));
    if (allIncluded) {
      newRoles[roleIdx].permissions = perms.filter((p: string) => !groupPermIds.includes(p));
    } else {
      newRoles[roleIdx].permissions = Array.from(new Set([...perms, ...groupPermIds]));
    }
    setFormData(prev => ({ ...prev, defaultRoles: newRoles }));
  };

  const addRole = () => {
    const newRoles = [...formData.defaultRoles, { id: `role_${Date.now()}`, name: 'New Role', permissions: [] }];
    setFormData(prev => ({ ...prev, defaultRoles: newRoles }));
    setActiveRoleIndex(newRoles.length - 1);
  };
  
  const removeRole = (idx: number) => {
    const role = formData.defaultRoles[idx];
    if (role.name.toLowerCase() === 'owner' || role.id === 'owner') {
      alert("Role Owner là role bắt buộc của hệ thống, không thể xóa.");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      defaultRoles: prev.defaultRoles.filter((_, i) => i !== idx)
    }));
    if (activeRoleIndex === idx) setActiveRoleIndex(Math.max(0, idx - 1));
    else if (activeRoleIndex > idx) setActiveRoleIndex(activeRoleIndex - 1);
  };

  const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <Button
      variant={active ? 'default' : 'ghost'}
      onClick={onClick}
      className={`flex items-center justify-start gap-3 px-4 py-3 h-auto rounded-xl font-bold transition-all w-full text-left ${
        active 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {category ? 'Chỉnh sửa Category Template' : 'Tạo Category Template mới'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Cấu hình đầy đủ luồng công việc, bảng và quyền hạn.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icons.plus size={24} className="rotate-45" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-r border-border bg-muted/30 p-4 flex flex-col gap-2 overflow-y-auto">
            <NavItem active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} icon={<Icons.layers size={18} />} label="Thông tin chung" />
            <NavItem active={activeTab === 'statuses'} onClick={() => setActiveTab('statuses')} icon={<Icons.layoutList size={18} />} label="Workflow Statuses" />
            <NavItem active={activeTab === 'columns'} onClick={() => setActiveTab('columns')} icon={<Icons.columns size={18} />} label="Board Columns" />
            <NavItem active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} icon={<Icons.users size={18} />} label="Roles & Permissions" />
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-card">
            {activeTab === 'basic' && (
              <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="text-lg font-bold text-foreground mb-6 border-b border-border pb-3">Thông tin cơ bản</h4>
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-1.5">Tên template *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/30 font-medium"
                    placeholder="VD: Software Development"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-1.5">Mô tả ngắn</Label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/30 resize-none font-medium"
                    placeholder="Mô tả về template này"
                  />
                </div>
              </div>
            )}

            {activeTab === 'statuses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Workflow Statuses</h4>
                    <p className="text-sm text-muted-foreground mt-1">Sử dụng chuột kéo thả (biểu tượng 6 chấm) để thay đổi thứ tự trạng thái.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addStatus} className="flex items-center gap-2 text-blue-500 hover:text-blue-400">
                    <Icons.plus size={16} /> Thêm Status
                  </Button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStatusDragEnd}>
                  <SortableContext items={formData.defaultStatuses.map((s: any) => s.statusId)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {formData.defaultStatuses.map((status, idx) => (
                        <SortableStatusItem
                          key={status.statusId}
                          status={status}
                          idx={idx}
                          updateStatus={updateStatus}
                          removeStatus={removeStatus}
                        />
                      ))}
                      {formData.defaultStatuses.length === 0 && <p className="text-muted-foreground text-sm italic">Chưa có status nào.</p>}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {activeTab === 'columns' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Board Columns</h4>
                    <p className="text-sm text-muted-foreground mt-1">Sử dụng chuột kéo thả cột (biểu tượng 6 chấm) để thay đổi thứ tự.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addColumn} className="flex items-center gap-2 text-blue-500 hover:text-blue-400">
                    <Icons.plus size={16} /> Thêm Cột
                  </Button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formData.defaultBoardColumns.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {formData.defaultBoardColumns.map((col, idx) => (
                        <SortableColumnItem
                          key={col.id}
                          col={col}
                          idx={idx}
                          updateColumn={updateColumn}
                          removeColumn={removeColumn}
                          toggleColumnStatus={toggleColumnStatus}
                          defaultStatuses={formData.defaultStatuses}
                        />
                      ))}
                      {formData.defaultBoardColumns.length === 0 && <p className="text-muted-foreground text-sm italic">Chưa có cột nào.</p>}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                  <h4 className="text-lg font-bold text-foreground">Roles & Permissions</h4>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border hide-scrollbar">
                    {formData.defaultRoles.map((role, idx) => (
                      <Button
                        variant="outline"
                        key={idx}
                        onClick={() => setActiveRoleIndex(idx)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap h-auto ${
                          activeRoleIndex === idx 
                            ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white border-blue-600' 
                            : 'bg-muted/30 text-muted-foreground border border-border hover:bg-muted hover:bg-muted/80 hover:text-foreground'
                        }`}
                      >
                        <Icons.lockKeyhole size={16} />
                        {role.name || 'Unnamed Role'}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addRole}
                      className="flex items-center justify-center gap-2 border-dashed text-muted-foreground font-bold hover:text-blue-400 hover:border-blue-400"
                    >
                      <Icons.plus size={16} />
                      Thêm Role
                    </Button>
                  </div>

                  {formData.defaultRoles.length > 0 && activeRoleIndex >= 0 && activeRoleIndex < formData.defaultRoles.length ? (() => {
                    const activeRole = formData.defaultRoles[activeRoleIndex];
                    const isOwner = activeRole.name.toLowerCase() === 'owner' || activeRole.id === 'owner';

                    return (
                      <div className="bg-muted/30 border border-border rounded-2xl p-6 relative overflow-hidden">
                        {isOwner && (
                          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            System Default
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted hover:bg-muted/80 text-blue-500'}`}>
                              <Icons.shield size={20} />
                            </div>
                            <Input
                              className={`text-lg font-bold bg-transparent text-foreground outline-none border-b border-transparent px-1 h-auto py-1 shadow-none rounded-none focus-visible:ring-0 ${isOwner ? 'cursor-not-allowed opacity-80' : 'focus:border-blue-500'}`}
                              value={activeRole.name}
                              disabled={isOwner}
                              placeholder="Role Name"
                              onChange={(e) => {
                                if (isOwner) return;
                                const newRoles = [...formData.defaultRoles];
                                newRoles[activeRoleIndex].name = e.target.value;
                                setFormData(prev => ({ ...prev, defaultRoles: newRoles }));
                              }}
                            />
                          </div>
                          {!isOwner && (
                            <Button 
                              variant="outline"
                              onClick={() => removeRole(activeRoleIndex)}
                              className="flex items-center gap-2 text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20"
                            >
                              <Icons.trash2 size={16} />
                              Xóa Role
                            </Button>
                          )}
                        </div>

                        {isOwner && (
                          <div className="mb-6 p-4 bg-card border border-border rounded-xl text-muted-foreground text-sm">
                            <Icons.info className="inline-block mr-2 text-emerald-500" size={16} />
                            Role <strong>Owner</strong> là role mặc định không thể xóa và có toàn quyền kiểm soát trong dự án. Các quyền dưới đây chỉ mang tính chất hiển thị.
                          </div>
                        )}

                        <div className={`space-y-6 ${isOwner ? 'opacity-60 pointer-events-none' : ''}`}>
                          {PERMISSION_GROUPS.map((group) => {
                            const groupPermIds = group.permissions.map(p => p.id);
                            const currentPerms = formData.defaultRoles[activeRoleIndex].permissions || [];
                            const allIncluded = groupPermIds.every(p => currentPerms.includes(p));
                            const someIncluded = groupPermIds.some(p => currentPerms.includes(p));

                            return (
                              <div key={group.name} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                                  <h4 className="font-bold text-sm text-foreground">{group.name}</h4>
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => toggleGroupPermissions(activeRoleIndex, groupPermIds)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors h-auto ${
                                      allIncluded ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30 hover:bg-blue-600/30 hover:text-blue-500' : 
                                      someIncluded ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-500' : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:bg-muted/80 border border-border'
                                    }`}
                                  >
                                    {allIncluded ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                  {group.permissions.map((perm) => {
                                    const isChecked = currentPerms.includes(perm.id);
                                    return (
                                      <Label key={perm.id} onClick={() => togglePermission(activeRoleIndex, perm.id)} className={`flex items-center gap-3 group ${isOwner ? 'cursor-default' : 'cursor-pointer'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                                          isChecked ? 'bg-blue-600 border-blue-500' : 'bg-muted/30 border-border group-hover:border-blue-500/50'
                                        }`}>
                                          {isChecked && <Icons.check size={14} className="text-white" />}
                                        </div>
                                        <span className={`text-sm select-none transition-colors ${isChecked ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                          {perm.label}
                                        </span>
                                      </Label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-12 bg-card border border-border border-dashed rounded-3xl">
                      <div className="w-14 h-14 bg-muted/30 text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                        <Icons.lockKeyhole size={24} />
                      </div>
                      <h3 className="text-foreground font-bold text-lg">Chưa có Role nào</h3>
                      <p className="text-muted-foreground text-sm mt-2">Hãy thêm role mới để cấu hình phân quyền.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}
