'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { FiDownload, FiEye, FiGithub, FiLinkedin, FiGlobe, FiMail, FiMapPin, FiLoader } from 'react-icons/fi';
import Link from 'next/link';

const TEMPLATE_STYLES = {
    modern: {
        name: 'Modern Dark',
        accent: '#7c3aed',
        bg: '#0f0f23',
        text: '#ffffff',
        subtext: '#a1a1aa',
        border: '#27272a',
        sectionBg: '#18181b',
    },
    minimal: {
        name: 'Minimal Light',
        accent: '#2563eb',
        bg: '#ffffff',
        text: '#111827',
        subtext: '#6b7280',
        border: '#e5e7eb',
        sectionBg: '#f9fafb',
    },
    professional: {
        name: 'Professional',
        accent: '#059669',
        bg: '#ffffff',
        text: '#111827',
        subtext: '#4b5563',
        border: '#d1fae5',
        sectionBg: '#f0fdf4',
    },
};

export default function CVBuilderPage() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [template, setTemplate] = useState('modern');
    const resumeRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [profileRes, projectsRes] = await Promise.all([
                api.get('/profiles/me'),
                api.get('/projects/my'),
            ]);
            setProfileData({
                ...profileRes.data,
                projects: projectsRes.data?.projects?.slice(0, 4) || [],
            });
        } catch (err) {
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!resumeRef.current) return;
        try {
            setDownloading(true);
            toast.loading('Generating PDF...', { id: 'pdf-gen' });

            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: template === 'modern' ? '#0f0f23' : '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${profileData?.fullName?.replace(/\s+/g, '_') || 'resume'}_CV.pdf`);

            toast.success('PDF downloaded!', { id: 'pdf-gen' });
        } catch (err) {
            console.error('PDF generation error:', err);
            toast.error('Failed to generate PDF', { id: 'pdf-gen' });
        } finally {
            setDownloading(false);
        }
    };

    const style = TEMPLATE_STYLES[template];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const p = profileData || {};
    const name = p.fullName || user?.fullName || 'Your Name';
    const headline = p.headline || '';
    const bio = p.bio || '';
    const skills = p.skills || [];
    const interests = p.interests || [];
    const social = p.socialLinks || {};
    const location = p.location;
    const education = p.education || [];
    const experience = p.experience || [];
    const projects = p.projects || [];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Top controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/profile" className="text-gray-500 hover:text-white text-sm mb-2 inline-block">← Back to Profile</Link>
                        <h1 className="text-3xl font-black text-white">CV Builder</h1>
                        <p className="text-gray-400 text-sm mt-1">Auto-generated from your SquadUp profile</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Template picker */}
                        <div className="flex gap-2">
                            {Object.entries(TEMPLATE_STYLES).map(([key, t]) => (
                                <button
                                    key={key}
                                    onClick={() => setTemplate(key)}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${template === key ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={downloadPDF}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl transition-all disabled:opacity-60 shadow-lg shadow-violet-600/30"
                        >
                            {downloading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Resume Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                >
                    <div
                        ref={resumeRef}
                        style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            fontFamily: 'Inter, system-ui, sans-serif',
                            minHeight: '297mm',
                            width: '210mm',
                            margin: '0 auto',
                            padding: '40px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Header */}
                        <div style={{ borderBottom: `3px solid ${style.accent}`, paddingBottom: '24px', marginBottom: '28px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: style.text }}>{name}</h1>
                            {headline && <p style={{ fontSize: '16px', color: style.accent, margin: '6px 0 12px', fontWeight: 600 }}>{headline}</p>}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
                                {p.email && (
                                    <span style={{ fontSize: '12px', color: style.subtext, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        ✉ {p.email}
                                    </span>
                                )}
                                {location?.city && (
                                    <span style={{ fontSize: '12px', color: style.subtext }}>
                                        📍 {[location.city, location.country].filter(Boolean).join(', ')}
                                    </span>
                                )}
                                {social.github && (
                                    <span style={{ fontSize: '12px', color: style.subtext }}>
                                        ⌨ {social.github.replace('https://github.com/', 'github.com/')}
                                    </span>
                                )}
                                {social.linkedin && (
                                    <span style={{ fontSize: '12px', color: style.subtext }}>
                                        💼 {social.linkedin.replace('https://linkedin.com/in/', 'linkedin.com/in/')}
                                    </span>
                                )}
                                {social.portfolio && (
                                    <span style={{ fontSize: '12px', color: style.subtext }}>
                                        🌐 {social.portfolio.replace('https://', '')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bio / Summary */}
                        {bio && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: style.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Summary</h2>
                                <p style={{ fontSize: '13px', lineHeight: '1.7', color: style.subtext }}>{bio}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: style.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Skills</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {skills.map(skill => (
                                        <span key={skill} style={{
                                            fontSize: '11px', fontWeight: 600, padding: '4px 12px',
                                            backgroundColor: `${style.accent}20`, color: style.accent,
                                            borderRadius: '20px', border: `1px solid ${style.accent}40`
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: style.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Experience</h2>
                                {experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '18px', paddingLeft: '14px', borderLeft: `2px solid ${style.accent}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: style.text }}>{exp.title}</p>
                                                <p style={{ fontSize: '12px', color: style.accent, marginTop: '2px' }}>{exp.company}</p>
                                            </div>
                                            <p style={{ fontSize: '11px', color: style.subtext, whiteSpace: 'nowrap' }}>
                                                {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} – {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                                            </p>
                                        </div>
                                        {exp.description && <p style={{ fontSize: '12px', color: style.subtext, marginTop: '6px', lineHeight: 1.6 }}>{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {education.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: style.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Education</h2>
                                {education.map((edu, i) => (
                                    <div key={i} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: `2px solid ${style.accent}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: style.text }}>{edu.degree} in {edu.fieldOfStudy}</p>
                                                <p style={{ fontSize: '12px', color: style.accent, marginTop: '2px' }}>{edu.institution}</p>
                                            </div>
                                            <p style={{ fontSize: '11px', color: style.subtext }}>
                                                {edu.startYear} – {edu.isCurrent ? 'Present' : edu.endYear || ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: style.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Projects</h2>
                                {projects.map((proj, i) => (
                                    <div key={i} style={{ marginBottom: '14px', padding: '12px', backgroundColor: style.sectionBg, borderRadius: '8px', border: `1px solid ${style.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: style.text }}>{proj.name}</p>
                                            <span style={{ fontSize: '10px', color: style.subtext, backgroundColor: `${style.accent}20`, padding: '2px 8px', borderRadius: '10px' }}>{proj.status}</span>
                                        </div>
                                        {proj.description && <p style={{ fontSize: '11px', color: style.subtext, marginTop: '6px', lineHeight: 1.6 }}>{proj.description?.slice(0, 150)}{proj.description?.length > 150 ? '...' : ''}</p>}
                                        {proj.skillsRequired?.length > 0 && (
                                            <p style={{ fontSize: '11px', color: style.accent, marginTop: '6px' }}>
                                                {proj.skillsRequired.slice(0, 5).join(' · ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ borderTop: `1px solid ${style.border}`, paddingTop: '16px', marginTop: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '10px', color: style.subtext }}>Generated with SquadUp • squadup.com</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tips */}
                <div className="mt-6 bg-violet-600/10 border border-violet-500/20 rounded-2xl p-4">
                    <p className="text-violet-300 font-semibold text-sm mb-1">💡 Tips for a better CV</p>
                    <p className="text-gray-400 text-sm">
                        Add more details to your profile — <Link href="/profile" className="text-violet-400 underline">headline, bio, skills</Link>,
                        <Link href="/settings" className="text-violet-400 underline ml-1">work experience, education</Link> — to make your CV more complete.
                    </p>
                </div>
            </main>
        </div>
    );
}
