'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiPlus, FiTrash2, FiArrowLeft, FiFolder,
    FiFigma, FiFileText, FiDatabase, FiCode, FiLink, FiExternalLink, FiX
} from 'react-icons/fi';

const CATEGORY_CONFIG = {
    design: { icon: FiFigma, label: 'Design & UI', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    docs: { icon: FiFileText, label: 'Documentation', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    database: { icon: FiDatabase, label: 'Database', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    code: { icon: FiCode, label: 'Code & APIs', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    other: { icon: FiLink, label: 'Other Links', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
};

export default function SquadResourcesPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({ title: '', url: '', category: 'docs' });

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await api.post(`/projects/${id}/resources`, form);
            setProject({ ...project, resources: res.data });
            setShowModal(false);
            setForm({ title: '', url: '', category: 'docs' });
            toast.success('Resource added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add resource');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await api.delete(`/projects/${id}/resources/${resourceId}`);
            setProject({ ...project, resources: project.resources.filter(r => r._id !== resourceId) });
            toast.success('Resource removed');
        } catch (error) {
            toast.error('Failed to delete resource');
        }
    };

    const isMember = project?.members?.some(m => m.user._id === user?._id);
    const isAdmin = project?.members?.some(m => m.user._id === user?._id && ['admin', 'moderator'].includes(m.role));
    
    // Group resources by category
    const groupedResources = project?.resources?.reduce((acc, resource) => {
        const cat = resource.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(resource);
        return acc;
    }, {}) || {};

    if (loading) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
                <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <FiFolder className="text-violet-500" /> Resource Hub
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">{project?.name} · All your squad's assets in one place</p>
                        </div>
                    </div>
                    {isMember && (
                        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                            <FiPlus /> Add Resource
                        </button>
                    )}
                </div>

                {!project?.resources?.length ? (
                    <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiFolder className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No resources yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">Start adding Figma links, API docs, or Google Drive folders so your squad can easily find them.</p>
                        {isMember && (
                            <button onClick={() => setShowModal(true)} className="btn-secondary mx-auto">Add First Resource</button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                            const items = groupedResources[key];
                            if (!items || items.length === 0) return null;
                            const Icon = config.icon;

                            return (
                                <div key={key}>
                                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${config.color}`}>
                                        <div className={`p-2 rounded-lg ${config.bg}`}><Icon className="w-4 h-4" /></div>
                                        {config.label} ({items.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map(item => (
                                            <a key={item._id} href={item.url} target="_blank" rel="noopener noreferrer" 
                                                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition-all group relative block">
                                                
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <FiExternalLink className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                                </div>
                                                
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                                                <p className="text-xs text-gray-500 truncate mb-4">{item.url}</p>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <img src={item.addedBy?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.addedBy?.fullName}`} 
                                                            className="w-5 h-5 rounded-full" alt="" />
                                                        <span className="text-[10px] text-gray-500 font-medium">Added by {item.addedBy?.fullName?.split(' ')[0]}</span>
                                                    </div>
                                                    
                                                    {(isAdmin || item.addedBy?._id === user?._id) && (
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); handleDelete(item._id); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        >
                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Add Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
                                <FiX className="w-5 h-5" />
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <FiLink className="text-violet-500" /> Add Resource
                            </h2>
                            <form onSubmit={handleAddResource} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Title</label>
                                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Figma Design System" className="input-field w-full" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">URL / Link</label>
                                    <input required type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." className="input-field w-full" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                            <button key={key} type="button" onClick={() => setForm({...form, category: key})}
                                                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.category === key ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300' : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                                                <config.icon className="w-4 h-4" /> {config.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting} className="btn-primary w-full mt-4 py-3.5">
                                    {submitting ? 'Adding...' : 'Save Resource'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
