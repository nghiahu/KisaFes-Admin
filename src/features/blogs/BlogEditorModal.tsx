import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { blogService } from '../../services/blogService';
import { uploadService } from '../../services/uploadService';
import type { BlogStatus } from '../../services/blogService';
import MDEditor from '@uiw/react-md-editor';

interface BlogEditorModalProps {
  blogId: string | null;
  onClose: () => void;
}

export default function BlogEditorModal({ blogId, onClose }: BlogEditorModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    thumbnailUrl: '',
    status: 'DRAFT' as BlogStatus,
    tags: [] as string[],
    publishAt: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => blogService.getBlogById(blogId!),
    enabled: !!blogId,
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        thumbnailUrl: blog.thumbnailUrl || '',
        status: blog.status || 'DRAFT',
        tags: blog.tags || [],
        publishAt: blog.publishAt ? new Date(blog.publishAt).toISOString().slice(0, 16) : ''
      });
      setIsScheduling(!!blog.publishAt && blog.status === 'PENDING');
    }
  }, [blog]);

  const createMutation = useMutation({
    mutationFn: (data: any) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => blogService.updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onClose();
    }
  });

  const handleSubmit = (actionType: 'PUBLISH_NOW' | 'SAVE_DRAFT' | 'SCHEDULE') => {
    let finalStatus = formData.status;
    let finalPublishAt = formData.publishAt;

    if (actionType === 'PUBLISH_NOW') {
      finalStatus = 'PUBLISHED';
      finalPublishAt = '';
    } else if (actionType === 'SAVE_DRAFT') {
      finalStatus = 'DRAFT';
    } else if (actionType === 'SCHEDULE') {
      if (formData.status === 'PUBLISHED' && !formData.publishDate) {
        alert(t('blogs.publishDateRequired'));
        return;
      }
      finalStatus = 'PENDING';
      if (!finalPublishAt) {
        alert("Vui lòng chọn ngày giờ đăng bài!");
        return;
      }
    }

    const payload = {
      ...formData,
      status: finalStatus,
      publishAt: finalPublishAt ? new Date(finalPublishAt).toISOString() : null
    };

    if (blogId) {
      updateMutation.mutate({ id: blogId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('blogs.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-blue-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Left Column - Content */}
        <div className="flex-1 bg-panel border border-border-subtle rounded-xl p-6 flex flex-col gap-6 shadow-2xl">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">TITLE</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full px-4 py-3 bg-background border border-border-subtle text-text-primary text-lg font-medium rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-text-secondary" 
              placeholder="Enter a compelling title..." 
            />
          </div>
          
          {/* Excerpt */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">EXCERPT (SHORT SUMMARY)</label>
            <textarea 
              rows={3}
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
              className="w-full px-4 py-3 bg-background border border-border-subtle text-text-primary text-sm rounded-lg focus:outline-none focus:border-blue-500 resize-none transition-colors placeholder-text-secondary" 
              placeholder="Write a brief summary of the post..." 
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[400px] max-h-[800px]" data-color-mode="light">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">CONTENT</label>
            </div>
            <div className="flex-1 overflow-hidden border border-border-subtle rounded-lg bg-background">
              <MDEditor
                value={formData.content}
                onChange={(val) => setFormData({...formData, content: val || ''})}
                height={500}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          
          {/* Publishing */}
          <div className="bg-panel border border-border-subtle rounded-xl p-6 shadow-xl">
            <h3 className="text-text-primary font-bold text-lg mb-4">Publishing</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleSubmit('PUBLISH_NOW')}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.title || !formData.content}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Icons.send size={16} />
                Publish Now
              </button>
              
              <div className="bg-background border border-border-subtle rounded-lg p-3">
                <button 
                  onClick={() => setIsScheduling(!isScheduling)}
                  className="w-full flex items-center justify-between text-text-secondary text-sm font-bold hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icons.calendar size={16} />
                    <span>Schedule Publish</span>
                  </div>
                  <Icons.chevronDown size={16} className={`transition-transform ${isScheduling ? 'rotate-180' : ''}`} />
                </button>
                
                {isScheduling && (
                  <div className="mt-3 pt-3 border-t border-border-subtle animate-in slide-in-from-top-2 duration-200">
                    <input 
                      type="datetime-local" 
                      value={formData.publishAt}
                      onChange={e => setFormData({...formData, publishAt: e.target.value})}
                      className="w-full px-3 py-2 bg-panel-hover border border-border-subtle text-text-primary text-xs rounded focus:outline-none focus:border-blue-500 mb-2"
                    />
                    <button 
                      onClick={() => handleSubmit('SCHEDULE')}
                      disabled={createMutation.isPending || updateMutation.isPending || !formData.title || !formData.content || !formData.publishAt}
                      className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleSubmit('SAVE_DRAFT')}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.title}
                className="w-full flex items-center justify-center gap-2 py-3 bg-background border border-border-subtle text-text-secondary text-sm font-bold rounded-lg hover:bg-panel-hover transition-colors disabled:opacity-50 mt-1"
              >
                <Icons.save size={16} />
                Save Draft
              </button>
              <button 
                onClick={onClose}
                className="w-full py-3 text-rose-400 text-sm font-bold hover:text-rose-300 mt-2 transition-colors"
              >
                Discard Post
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-panel border border-border-subtle rounded-xl p-6 shadow-xl">
            <h3 className="text-text-primary font-bold text-lg mb-4">Thumbnail</h3>
            <label className="w-full h-32 border-2 border-dashed border-border-subtle bg-background rounded-lg flex flex-col items-center justify-center text-text-secondary mb-4 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors overflow-hidden">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Icons.refreshCw size={24} className="mb-2 animate-spin" />
                  <span className="text-xs font-semibold">Uploading...</span>
                </div>
              ) : formData.thumbnailUrl ? (
                <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Icons.image size={24} className="mb-2" />
                  <span className="text-xs font-semibold">Click to upload or drag image</span>
                </>
              )}
            </label>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">IMAGE URL</label>
              <input 
                type="text" 
                value={formData.thumbnailUrl} 
                onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                className="w-full px-3 py-2.5 bg-background border border-border-subtle text-text-primary text-xs rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-text-secondary" 
                placeholder="https://images.unsplash.com/..." 
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-panel border border-border-subtle rounded-xl p-6 shadow-xl">
            <h3 className="text-text-primary font-bold text-lg mb-4">Tags</h3>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">TAGS</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-panel-hover text-text-primary text-xs font-semibold rounded-full border border-border-subtle">
                    #{tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="text-text-secondary hover:text-rose-400 transition-colors"
                    >
                      <Icons.x size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-3 py-2.5 bg-background border border-border-subtle text-text-primary text-xs rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-text-secondary" 
                placeholder="Add tags... (Press Enter)" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
