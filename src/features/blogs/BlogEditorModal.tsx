import { Label } from '@/components/ui/Label';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { blogService } from '../../services/blogService';
import { uploadService } from '../../services/uploadService';
import type { BlogStatus } from '../../services/blogService';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { BlogEditorModalProps } from '../../types';


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
      if (formData.status === 'PUBLISHED' && !formData.publishAt) {
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
        <div className="flex-1 bg-card border border-border rounded-xl p-6 flex flex-col gap-6 shadow-2xl">
          {/* Title */}
          <div>
            <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">TITLE</Label>
            <Input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="bg-background font-medium" 
              placeholder="Enter a compelling title..." 
            />
          </div>
          
          {/* Excerpt */}
          <div>
            <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">EXCERPT (SHORT SUMMARY)</Label>
            <textarea 
              rows={3}
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
              className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm rounded-lg focus:outline-none focus:border-blue-500 resize-none transition-colors placeholder:text-muted-foreground" 
              placeholder="Write a brief summary of the post..." 
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[400px] max-h-[800px]" data-color-mode="light">
            <div className="flex justify-between items-end mb-2">
              <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CONTENT</Label>
            </div>
            <div className="flex-1 overflow-hidden border border-border rounded-lg bg-background">
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
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <h3 className="text-foreground font-bold text-lg mb-4">Publishing</h3>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleSubmit('PUBLISH_NOW')}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.title || !formData.content}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Icons.send size={16} />
                Publish Now
              </Button>
              
              <div className="bg-background border border-border rounded-lg p-3">
                <Button 
                  variant="ghost"
                  onClick={() => setIsScheduling(!isScheduling)}
                  className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Icons.calendar size={16} />
                    <span>Schedule Publish</span>
                  </div>
                  <Icons.chevronDown size={16} className={`transition-transform ${isScheduling ? 'rotate-180' : ''}`} />
                </Button>
                
                {isScheduling && (
                  <div className="mt-3 pt-3 border-t border-border animate-in slide-in-from-top-2 duration-200">
                    <Input 
                      type="datetime-local" 
                      value={formData.publishAt}
                      onChange={e => setFormData({...formData, publishAt: e.target.value})}
                      className="bg-muted text-xs mb-2"
                    />
                    <Button 
                      onClick={() => handleSubmit('SCHEDULE')}
                      disabled={createMutation.isPending || updateMutation.isPending || !formData.title || !formData.content || !formData.publishAt}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Confirm Schedule
                    </Button>
                  </div>
                )}
              </div>

              <Button 
                variant="outline"
                onClick={() => handleSubmit('SAVE_DRAFT')}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.title}
                className="w-full flex items-center justify-center gap-2 mt-1"
              >
                <Icons.save size={16} />
                Save Draft
              </Button>
              <Button 
                variant="ghost"
                onClick={onClose}
                className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 mt-2"
              >
                Discard Post
              </Button>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <h3 className="text-foreground font-bold text-lg mb-4">Thumbnail</h3>
            <Label className="w-full h-32 border-2 border-dashed border-border bg-background rounded-lg flex flex-col items-center justify-center text-muted-foreground mb-4 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors overflow-hidden">
              <Input 
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
            </Label>
            <div>
              <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">IMAGE URL</Label>
              <Input 
                type="text" 
                value={formData.thumbnailUrl} 
                onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                className="bg-background text-xs" 
                placeholder="https://images.unsplash.com/..." 
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <h3 className="text-foreground font-bold text-lg mb-4">Tags</h3>
            <div>
              <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">TAGS</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground text-xs font-semibold rounded-full border border-border">
                    #{tag}
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-rose-400 transition-colors h-auto w-auto p-0 border-0 bg-transparent hover:bg-transparent"
                    >
                      <Icons.x size={12} />
                    </Button>
                  </span>
                ))}
              </div>
              <Input 
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-background text-xs" 
                placeholder="Add tags... (Press Enter)" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
