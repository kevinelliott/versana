'use client';

import React from 'react';
import styles from './PlanningOutlining.module.css';

export default function PlanningOutlining() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 2: Planning & Outlining</h1>
            </div>

            <div className={styles.board}>
                <div className={styles.column}>
                    <div className={styles.colHeader}>Act I: Setup</div>
                    <div className={styles.card}>
                        <h4>1. The Hook</h4>
                        <p>Introduce Captain Aris and the brutal winter on the ridge. Establish the stakes.</p>
                    </div>
                    <div className={styles.card}>
                        <h4>2. Inciting Incident</h4>
                        <p>The transmission from High Command is intercepted. The Hegemony knows their location.</p>
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.colHeader}>Act II: Rising Action</div>
                    <div className={styles.card}>
                        <h4>3. Crossing the Threshold</h4>
                        <p>Aris decides to abandon the fort and lead the civilians through the frozen pass.</p>
                    </div>
                    <div className={styles.card}>
                        <h4>4. First Obstacle</h4>
                        <p>An avalanche blocks the pass. Mira has to rig the plasma cores to blast a way through.</p>
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.colHeader}>Act III: Resolution</div>
                    <div className={styles.card}>
                        <h4>5. The Climax</h4>
                        <p>The Hegemony dreadnought arrives. Aris stays behind to hold the line.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
