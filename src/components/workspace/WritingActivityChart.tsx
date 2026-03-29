import React, { useMemo } from 'react';

export interface DailyLog {
    log_date: string;
    daily_words_written: number;
    total_words: number;
    mana_spent: number;
}

interface Props {
    logs: DailyLog[];
    targetDailyWordCount?: number;
}

export default function WritingActivityChart({ logs, targetDailyWordCount = 1000 }: Props) {
    const data = useMemo(() => {
        if (!logs || logs.length === 0) return [];
        // Extract the last 14 logs (or however many exist)
        const recentLogs = logs.slice(-14);
        
        let maxWords = Math.max(...recentLogs.map(l => l.daily_words_written), targetDailyWordCount);
        // Avoid division by zero
        if (maxWords < 100) maxWords = 1000;

        return recentLogs.map((log) => {
            const heightPercent = Math.min(100, (log.daily_words_written / maxWords) * 100);
            const isTargetMet = log.daily_words_written >= targetDailyWordCount;
            
            // Format date for display (e.g., "Mon 12")
            const dateObj = new Date(log.log_date);
            const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            
            return {
                ...log,
                heightPercent,
                isTargetMet,
                displayDate,
            };
        });
    }, [logs, targetDailyWordCount]);

    if (data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Not enough data to display velocity chart. Keep writing!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', position: 'relative', paddingTop: '1rem', minHeight: '160px' }}>
                {/* Target Line */}
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed var(--border-color)',
                    zIndex: 0,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <span style={{ position: 'absolute', right: 0, top: '-1rem', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', paddingLeft: '4px' }}>
                        Target: {targetDailyWordCount}
                    </span>
                </div>

                {data.map((bar, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            zIndex: 1, 
                            height: '100%', 
                            justifyContent: 'flex-end'
                        }}
                        title={`${bar.daily_words_written} words on ${bar.displayDate}`}
                    >
                        <div style={{
                            width: '100%',
                            maxWidth: '32px',
                            background: bar.isTargetMet ? 'var(--accent-green)' : 'var(--accent-blue)',
                            height: `${Math.max(2, bar.heightPercent)}%`,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease',
                            opacity: bar.daily_words_written === 0 ? 0.3 : 1
                        }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {bar.displayDate.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
