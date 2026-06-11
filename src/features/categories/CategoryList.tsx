import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { categoryService } from '../../services/categoryService';
import type { CategoryTemplate } from '../../services/categoryService';
import CategoryEditorModal from './CategoryEditorModal';
import ConfirmModal from '../../shared/components/ConfirmModal';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function CategoryList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTemplate | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  ) || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (error) => {
      console.error(t('categories.saveError'), error);
      alert(t('categories.genericError'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (error) => {
      console.error(t('categories.saveError'), error);
      alert(t('categories.genericError'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (error) => {
      console.error(t('categories.deleteError'), error);
      alert(t('categories.genericError'));
    }
  });

  const openModal = (category?: CategoryTemplate) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (formData: any) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteMutation.mutateAsync(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('categories.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('categories.description')}</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20"
        >
          <Icons.plus size={20} />
          <span>{t('categories.createBtn')}</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Icons.search size={18} />
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('categories.searchPlaceholder')}
          className="pl-10 w-full rounded-xl bg-muted shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.refreshCw size={32} className="animate-spin text-blue-500 mb-4" />
            <p className="text-muted-foreground">{t('categories.loadingTemplates')}</p>
          </div>
        ) : (
          <>
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-card rounded-xl overflow-hidden flex flex-col shadow-sm border border-border"
              >
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => openModal(category)}
                        className="text-slate-400 hover:text-foreground"
                      >
                        <Icons.edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setCategoryToDelete({ id: category.id, name: category.name })}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Icons.trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-5 flex-1">
                  {/* Workflow Statuses */}
                  <div>
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Icons.layoutList size={14} /> WORKFLOW STATUSES
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.defaultStatuses && category.defaultStatuses.length > 0 ? (
                        category.defaultStatuses.map((s) => (
                          <span
                            key={s.statusId}
                            className="px-3 py-1 rounded text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: s.color || '#4B5563' }}
                          >
                            {s.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">{t('categories.notConfigured')}</span>
                      )}
                    </div>
                  </div>

                  {/* Board Columns */}
                  <div>
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Icons.columns size={14} /> BOARD COLUMNS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.defaultBoardColumns && category.defaultBoardColumns.length > 0 ? (
                        category.defaultBoardColumns
                          .sort((a, b) => a.position - b.position)
                          .map((col) => (
                            <span
                              key={col.name}
                              className="px-3 py-1 border border-border rounded-full text-xs font-medium text-muted-foreground"
                            >
                              {col.name}
                            </span>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">{t('categories.notConfigured')}</span>
                      )}
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Icons.users size={14} /> ROLES
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.defaultRoles && category.defaultRoles.length > 0 ? (
                        category.defaultRoles.map((role) => (
                          <span
                            key={role.id}
                            className="px-3 py-1 bg-muted rounded text-xs font-semibold text-blue-500"
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">{t('categories.notConfigured')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Template Card */}
            <div 
              onClick={() => openModal()}
              className="group cursor-pointer bg-transparent border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 hover:bg-muted transition-colors min-h-[300px]"
            >
              <div className="w-12 h-12 bg-muted border border-border rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.plus size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Tạo template mới</h3>
              <p className="text-sm text-muted-foreground text-center">Bắt đầu với một cấu trúc danh mục tùy chỉnh</p>
            </div>
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="bg-card border border-border px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
            <Icons.layoutList size={18} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Templates</p>
            <p className="text-sm text-foreground font-bold">{filteredCategories.length} Active</p>
          </div>
        </div>
        <div className="bg-card border border-border px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
            <Icons.clock3 size={18} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Last Updated</p>
            <p className="text-sm text-foreground font-bold">Just now</p>
          </div>
        </div>
      </div>

      <CategoryEditorModal
        isOpen={isModalOpen}
        category={editingCategory}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Xác nhận xóa Template"
        message={
          <>
            Bạn có chắc chắn muốn xóa template <strong className="text-foreground">"{categoryToDelete?.name}"</strong>? Thao tác này không thể hoàn tác.
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isLoading={deleteMutation.isPending}
        confirmText="Xóa vĩnh viễn"
      />
    </div>
  );
}
