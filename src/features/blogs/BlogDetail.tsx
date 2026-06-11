import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../shared/assets/icons';
import { blogService } from '../../services/blogService';
import type { BlogStatus } from '../../services/blogService';
import MDEditor from '@uiw/react-md-editor';
import ConfirmModal from '../../shared/components/ConfirmModal';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import type { BlogDetailProps } from '../../types';


export default function BlogDetail({ blogId, onBack, onEdit }: BlogDetailProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => blogService.getBlogById(blogId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onBack();
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;
  }

  if (!blog) {
    return <div className="p-8 text-center text-muted-foreground">Blog not found.</div>;
  }

  const getStatusColor = (status: BlogStatus) => {
    switch(status) {
      case 'PUBLISHED': return 'text-emerald-500';
      case 'PENDING': return 'text-amber-500';
      case 'DRAFT': return 'text-slate-400';
      case 'ARCHIVED': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const calculateTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} mins ago`;
    }
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>Blog Management</span>
          <Icons.chevronRight size={14} />
          <span className="text-foreground font-medium">Post Detail View</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Icons.arrowRight className="rotate-180" size={16} />
            <span>BACK TO LIST</span>
          </Button>
          <Button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Icons.edit2 size={16} />
            <span>EDIT POST</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {blog.tags?.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-blue-500 border border-border">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
          {blog.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden flex-shrink-0">
              {getInitials(blog.authorName)}
            </div>
            <div>
              <div className="text-foreground font-bold text-base">{blog.authorName || 'Admin'}</div>
              <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1.5">
                Content Creator • 
                {blog.publishAt ? (
                  <span className={blog.status === 'PENDING' ? 'text-amber-500' : ''}>
                    {blog.status === 'PENDING' ? 'Scheduled for ' : 'Published '}{formatDate(blog.publishAt, true)}
                  </span>
                ) : (
                  <span className="italic text-muted-foreground">Drafted {formatDate(blog.createdAt, true)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mr-2">STATUS</div>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(blog.status).replace('text-', 'bg-')} bg-current`} />
            <span className={`text-sm font-bold ${getStatusColor(blog.status)} capitalize`}>
              {blog.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {blog.thumbnailUrl && (
        <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-border shadow-2xl relative group">
          <img 
            src={blog.thumbnailUrl} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
        </div>
      )}

      {/* Content Layout */}
      <div className="max-w-4xl mx-auto pt-4">
        {/* Main Content */}
        <div className="prose dark:prose-invert max-w-none">
          <div data-color-mode="light" className="bg-transparent dark:hidden block">
            <MDEditor.Markdown 
              source={blog.content || '_No content available_'} 
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.8' }} 
            />
          </div>
          <div data-color-mode="dark" className="bg-transparent dark:block hidden">
            <MDEditor.Markdown 
              source={blog.content || '_No content available_'} 
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.8' }} 
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-12 border-t border-border">
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <Icons.share2 size={18} className="cursor-pointer hover:text-foreground transition-colors" />
          <Icons.layoutGrid size={18} className="cursor-pointer hover:text-foreground transition-colors" />
          <span className="ml-4 italic text-xs">
            Last modified {calculateTimeAgo(blog.updatedAt || blog.createdAt)} by {blog.authorName}
          </span>
        </div>
        <Button 
          variant="outline"
          onClick={() => setIsDeleting(true)}
          className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 w-full sm:w-auto"
        >
          DELETE POST
        </Button>
      </div>

      <ConfirmModal
        isOpen={isDeleting}
        title={t('blogs.deleteTitle')}
        message={<>{t('blogs.deleteConfirm1')} <strong>{blog.title}</strong>{t('blogs.deleteConfirm2')}</>}
        onConfirm={() => deleteMutation.mutate(blog.id)}
        onCancel={() => setIsDeleting(false)}
        isLoading={deleteMutation.isPending}
        confirmText={t('blogs.deleteBtn')}
      />

    </div>
  );
}
