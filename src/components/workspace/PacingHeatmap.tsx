import React, { useMemo } from 'react';
import styles from './PacingHeatmap.module.css';

interface PacingHeatmapProps {
    text: string;
}

const ACTION_WORDS = ['suddenly', 'ran', 'hit', 'shot', 'exploded', 'fast', 'slammed', 'shouted', 'blood', 'blade', 'gun', 'impact'];
const CALM_WORDS = ['thought', 'wondered', 'felt', 'slowly', 'breeze', 'quiet', 'watched', 'silence', 'peaceful', 'stared', 'remembered'];

export default function PacingHeatmap({ text }: PacingHeatmapProps) {
    const analysis = useMemo(() => {
        if (!text) return [];
        // Split by paragraph
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

        return paragraphs.map((p, index) => {
            const words = p.toLowerCase().split(/\s+/).filter(w => w.length > 0);
            const wordCount = words.length;

            // Calculate pace: fewer words = faster pace (clamped)
            // Long > 60 words: slow (0)
            // Short < 15 words: fast (100)
            let paceScore = 100 - ((wordCount / 60) * 100);
            if (paceScore < 0) paceScore = 0;
            if (paceScore > 100) paceScore = 100;

            // Emotional Heat
            let actionHits = 0;
            let calmHits = 0;

            words.forEach(w => {
                if (ACTION_WORDS.some(aw => w.includes(aw))) actionHits++;
                if (CALM_WORDS.some(cw => w.includes(cw))) calmHits++;
            });

            return {
                index,
                wordCount,
                paceScore,
                actionHits,
                calmHits,
                snippet: p.substring(0, 50) + '...'
            };
        });
    }, [text]);

    if (analysis.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>Start writing to see pacing analysis.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Pacing & Emotional Heatmap</h3>
                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <div className={styles.box} style={{ background: 'var(--tag-red-bg)' }}></div>
                        Fast / Action
                    </div>
                    <div className={styles.legendItem}>
                        <div className={styles.box} style={{ background: 'var(--tag-blue-bg)' }}></div>
                        Slow / Introspective
                    </div>
                </div>
            </div>

            <div className={styles.visualizer}>
                {analysis.map((block) => {
                    // Determine color based on pace and sentiment
                    let background = 'var(--bg-tertiary)'; // default neutral
                    let height = '20px'; // base height

                    if (block.paceScore > 70 || block.actionHits > block.calmHits) {
                        background = 'var(--tag-red-bg)'; // Fast / Action
                        height = `${Math.min(100, 30 + (block.paceScore * 0.7))}px`; // Taller for faster
                    } else if (block.paceScore < 30 || block.calmHits > block.actionHits) {
                        background = 'var(--tag-blue-bg)'; // Slow / Calm
                        height = `${Math.max(10, 80 - (block.wordCount * 0.5))}px`; // Shorter for slower
                    } else {
                        background = 'var(--tag-purple-bg)'; // Balanced/Dialogue
                        height = '40px';
                    }

                    return (
                        <div
                            key={block.index}
                            className={styles.bar}
                            style={{ height, background }}
                            title={`Para ${block.index + 1}: ${block.wordCount} words\nSnippet: ${block.snippet}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
