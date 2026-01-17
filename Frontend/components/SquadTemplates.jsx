'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const CATEGORY_ICONS = {
    web: '🌐',
    mobile: '📱',
    ai_ml: '🤖',
    blockchain: '⛓️',
    game: '🎮',
    iot: '💡',
    other: '🚀',
};

export default function SquadTemplates() {
    const router = useRouter();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get('/api/templates');
            setTemplates(data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async (templateId) => {
        const squadName = prompt('Enter a name for your new squad:');
        if (!squadName) return;

        try {
            const { data } = await axios.post(`/api/templates/${templateId}/create-squad`, {
                name: squadName,
            });

            toast.success('Squad created successfully!');
            router.push(`/squads/${data._id}`);
        } catch (error) {
            toast.error('Failed to create squad from template');
        }
    };

    const filteredTemplates = selectedCategory === 'all'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Squad Templates
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Quick-start your project with pre-configured squad templates
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    All Templates
                </button>
                {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${selectedCategory === category
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        <span>{icon}</span>
                        <span className="capitalize">{category.replace('_', '/')}</span>
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <motion.div
                        key={template._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                        {/* Icon and Badge */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-5xl">{template.icon || CATEGORY_ICONS[template.category]}</div>
                            {template.isOfficial && (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                                    Official
                                </span>
                            )}
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            {template.description}
                        </p>

                        {/* Skills */}
                        {template.suggestedSkills && template.suggestedSkills.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Suggested Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                    {template.suggestedSkills.slice(0, 5).map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {template.suggestedSkills.length > 5 && (
                                        <span className="px-2 py-1 text-xs text-gray-500">
                                            +{template.suggestedSkills.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <span>{template.defaultRules?.length || 0} default rules</span>
                            <span>{template.usageCount || 0} squads created</span>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => handleUseTemplate(template._id)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Use This Template
                        </button>
                    </motion.div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        No templates found in this category
                    </p>
                </div>
            )}
        </div>
    );
}
