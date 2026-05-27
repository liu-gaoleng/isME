'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { ErrorMessage } from '@/components/Loading';

export default function CreateArticle() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        coverImage: '',
        isPublished: false,
        isFeatured: false,
        categoryId: '',
        tagNames: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await post(API_ENDPOINTS.articles, {
                ...formData,
                categoryId: formData.categoryId ? Number(formData.categoryId) : null,
                tagNames: formData.tagNames ? formData.tagNames.split(',').map(t => t.trim()) : [],
            });
            router.push('/admin/articles');
        } catch (err) {
            setError(err instanceof Error ? err.message : '创建失败');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mt-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">创建文章</h2>
            </div>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="文章标题"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="URL friendly name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                    <textarea
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="文章摘要"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={10}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="文章内容"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
                    <input
                        type="text"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="图片URL"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">选择分类</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                    <input
                        type="text"
                        name="tagNames"
                        value={formData.tagNames}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="多个标签用逗号分隔"
                    />
                </div>

                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">发布文章</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">设为精选</span>
                    </label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {submitting ? '提交中...' : '创建文章'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/articles')}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
}
