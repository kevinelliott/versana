'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    job_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress_percent: number;
    progress_message: string;
}

export default function BackgroundJobTracker() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const supabase = createClient();

    const fetchActiveJobs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('background_jobs')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['pending', 'processing'])
            .order('created_at', { ascending: false });

        if (data) setJobs(data);
    };

    useEffect(() => {
        fetchActiveJobs();

        let channel: any;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel(`public:background_jobs:user_id=eq.${user.id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'background_jobs',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    const updatedJob = payload.new as Job;
                    setJobs(prev => {
                        // If it completed or failed, keep it visible for 5 seconds then remove
                        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
                            setTimeout(() => {
                                setJobs(current => current.filter(j => j.id !== updatedJob.id));
                            }, 5000);
                        }
                        
                        // If we already have it, update it
                        const exists = prev.find(j => j.id === updatedJob.id);
                        if (exists) {
                            return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
                        }
                        // Otherwise add it
                        return [updatedJob, ...prev];
                    });
                })
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    if (jobs.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 9999
        }}>
            {jobs.map(job => (
                <div key={job.id} style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    minWidth: '280px',
                    transition: 'all 0.3s ease'
                }}>
                    {job.status === 'pending' || job.status === 'processing' ? (
                        <Loader2 size={18} className="spinner" color="var(--accent-blue)" />
                    ) : job.status === 'completed' ? (
                        <CheckCircle2 size={18} color="var(--tag-green-text)" />
                    ) : (
                        <AlertCircle size={18} color="var(--tag-red-text)" />
                    )}

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {job.job_type.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {job.status === 'completed' ? 'Finished successfully.' : 
                             job.status === 'failed' ? 'Failed to process.' : 
                             job.progress_message || 'Processing...'}
                        </div>
                        {(job.status === 'pending' || job.status === 'processing') && (
                            <div style={{ width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    background: 'var(--accent-blue)', 
                                    width: `${job.progress_percent || 0}%`,
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
