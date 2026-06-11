import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { blogService } from '../../services/blogService';
import type { BlogStatus } from '../../services/blogService';
import BlogEditorModal from './BlogEditorModal';
import BlogDetail from './BlogDetail';
import ConfirmModal from '../../shared/components/ConfirmModal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function BlogList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogStatus | ''>('');
  const [sortBy, setSortBy] = useState('publishAt');
  const [sortDir, setSortDir] = useState('desc');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [viewingBlogId, setViewingBlogId] = useState<string | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () => blogService.getBlogs(page, 10, debouncedSearch, statusFilter, sortBy, sortDir) as any,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setDeletingBlog(null);
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
    setPage(1);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <Icons.moreVertical size={14} className="text-slate-600 opacity-50" />;
    return sortDir === 'asc' ? <Icons.chevronUp size={14} className="text-blue-400" /> : <Icons.chevronDown size={14} className="text-blue-400" />;
  };

  const openEditor = (id?: string) => {
    setEditingBlogId(id || null);
    setIsEditorOpen(true);
  };

  const getStatusColor = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'text-emerald-500';
      case 'PENDING': return 'text-amber-500';
      case 'DRAFT': return 'text-slate-400';
      case 'ARCHIVED': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  // Format dates: Oct 24, 2023
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const pendingCount = data?.content?.filter((b: any) => b.status === 'PENDING').length || 0;
  const totalViews = data?.content?.reduce((acc: number, b: any) => acc + (b.views || 0), 0) || 0;

  if (isEditorOpen) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {editingBlogId ? t('blogs.editArticle') : t('blogs.newArticle')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('blogs.editorDesc')}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditorOpen(false)}
            className="flex items-center gap-2"
          >
            <Icons.chevronLeft size={18} />
            <span>{t('blogs.backToList')}</span>
          </Button>
        </div>
        <BlogEditorModal
          blogId={editingBlogId}
          onClose={() => setIsEditorOpen(false)}
        />
      </div>
    );
  }

  if (viewingBlogId) {
    return (
      <BlogDetail
        blogId={viewingBlogId}
        onBack={() => setViewingBlogId(null)}
        onEdit={() => { setViewingBlogId(null); openEditor(viewingBlogId); }}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('blogs.management')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('blogs.managementDesc')}</p>
        </div>
        <Button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700"
        >
          <Icons.plus size={18} />
          <span>{t('blogs.newArticle')}</span>
        </Button>
      </div>

      {/* Main Panel */}
      <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex gap-4 w-full sm:w-auto flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder={t('blogs.searchPlaceholder')}
                value={search}
                onChange={handleSearch}
                className="w-full pl-9 bg-muted"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as BlogStatus | ''); setPage(1); }}
              className="bg-muted border border-border text-sm text-muted-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">{t('blogs.statusAll')}</option>
              <option value="PUBLISHED">{t('blogs.published')}</option>
              <option value="PENDING">{t('blogs.pending')}</option>
              <option value="DRAFT">{t('blogs.draft')}</option>
              <option value="ARCHIVED">{t('blogs.archived')}</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm table-fixed">
            <TableHeader className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border select-none">
              <TableRow>
                <TableHead
                  className="pb-4 font-bold cursor-pointer hover:text-foreground transition-colors group/sort w-[30%]"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">{t('blogs.colTitle')} {renderSortIcon('title')}</div>
                </TableHead>
                <TableHead className="pb-4 font-bold w-[20%]">{t('blogs.colTags')}</TableHead>
                <TableHead
                  className="pb-4 font-bold cursor-pointer hover:text-foreground transition-colors group/sort w-[15%]"
                  onClick={() => handleSort('author.fullname')}
                >
                  <div className="flex items-center gap-2">{t('blogs.colAuthor')} {renderSortIcon('author.fullname')}</div>
                </TableHead>
                <TableHead
                  className="pb-4 font-bold cursor-pointer hover:text-foreground transition-colors group/sort w-[10%]"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">{t('blogs.colStatus')} {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead
                  className="pb-4 font-bold cursor-pointer hover:text-foreground transition-colors group/sort w-[15%]"
                  onClick={() => handleSort('publishAt')}
                >
                  <div className="flex items-center gap-2">{t('blogs.colDate')} {renderSortIcon('publishAt')}</div>
                </TableHead>
                <TableHead className="pb-4 font-bold text-right w-[10%]">{t('blogs.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t('blogs.loading')}</TableCell></TableRow>
              ) : !data?.content?.length ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t('blogs.noBlogs')}</TableCell></TableRow>
              ) : (
                data.content.map((blog: any) => (
                  <TableRow key={blog.id} className="hover:bg-muted transition-colors group">
                    <TableCell className="py-4 pr-4">
                      <div className="flex items-center gap-4">
                        {blog.thumbnailUrl ? (
                          <img src={blog.thumbnailUrl} alt={blog.title} loading="lazy" className="w-14 h-14 rounded-lg object-cover bg-card flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                            <Icons.image className="text-muted-foreground" size={20} />
                          </div>
                        )}
                        <div className="flex flex-col justify-center min-w-0 w-full">
                          <p className="font-bold text-foreground text-[15px] leading-tight hover:text-blue-500 cursor-pointer transition-colors truncate">{blog.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-2 overflow-hidden">
                        {blog.tags && blog.tags.length > 0 ? (
                          blog.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-muted text-blue-500 border border-border">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                            {t('blogs.noTags')}
                          </span>
                        )}
                        {blog.tags && blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                            +{blog.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {getInitials(blog.authorName)}
                        </div>
                        <span className="text-white font-medium text-sm">
                          {blog.authorName?.split(' ').slice(-2).join(' ') || 'Admin'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(blog.status).replace('text-', 'bg-')} bg-current`} />
                        <span className={`text-sm font-bold ${getStatusColor(blog.status)} capitalize`}>
                          {blog.status.toLowerCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground text-sm">
                      {blog.publishAt ? (
                        <div className="flex flex-col">
                          <span className={blog.status === 'PENDING' ? 'text-amber-500 text-xs' : ''}>
                            {formatDate(blog.publishAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          {blog.status === 'DRAFT' ? t('blogs.draftPrefix') : ''}{formatDate(blog.createdAt)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setViewingBlogId(blog.id)} className="text-muted-foreground hover:text-foreground" title={t('blogs.view')}>
                          <Icons.eye size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditor(blog.id)} className="text-muted-foreground hover:text-blue-500" title={t('blogs.edit')}>
                          <Icons.edit3 size={18} />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setDeletingBlog(blog)}
                          className="text-slate-400 hover:text-red-400"
                          title={t('blogs.delete')}
                        >
                          <Icons.trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-4 sm:mb-0">
            {t('blogs.pageInfo', { from: (page - 1) * 10 + 1, to: Math.min(page * 10, data?.totalElements || 0), total: data?.totalElements || 0 })}
          </p>

          {data?.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center p-0"
              >
                <Icons.chevronLeft size={16} />
              </Button>

              {/* Render page numbers */}
              {Array.from({ length: Math.min(5, data.totalPages) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (data.totalPages > 5 && page > 3) {
                  pageNum = page - 2 + idx;
                }
                if (pageNum > data.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center p-0 ${page === pageNum ? '' : 'text-muted-foreground'}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {data.totalPages > 5 && page < data.totalPages - 2 && (
                <>
                  <span className="text-muted-foreground mx-1">...</span>
                  <Button
                    variant="ghost"
                    onClick={() => setPage(data.totalPages)}
                    className="w-8 h-8 flex items-center justify-center p-0 text-muted-foreground"
                  >
                    {data.totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                disabled={page === data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center p-0"
              >
                <Icons.chevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500">
            <Icons.trendingUp size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">TOTAL VIEWS</p>
            <p className="text-3xl font-bold text-foreground">{(totalViews / 1000).toFixed(1)}k</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-500">
            <Icons.messageSquare size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">ENGAGEMENT</p>
            <p className="text-3xl font-bold text-foreground">14.2%</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-900/30 flex items-center justify-center text-rose-500">
            <Icons.clock3 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">PENDING REVIEW</p>
            <p className="text-3xl font-bold text-foreground">{String(pendingCount).padStart(2, '0')}</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingBlog}
        title={t('blogs.deleteTitle')}
        message={<>{t('blogs.deleteConfirm1')} <strong>{deletingBlog?.title}</strong>{t('blogs.deleteConfirm2')}</>}
        onConfirm={() => deletingBlog && deleteMutation.mutate(deletingBlog.id)}
        onCancel={() => setDeletingBlog(null)}
        isLoading={deleteMutation.isPending}
        confirmText={t('blogs.deleteBtn')}
      />
    </div>
  );
}
