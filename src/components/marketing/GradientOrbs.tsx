'use client';
import React, { useEffect, useState } from 'react';
import styles from './GradientOrbs.module.css';

export default function GradientOrbs() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className={styles.container}>
            <div 
                className={styles.orb1} 
                style={{ transform: `translate(${mousePos.x * -0.05}px, ${mousePos.y * -0.05}px)` }}
            />
            <div 
                className={styles.orb2} 
                style={{ transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)` }}
            />
        </div>
    );
}
