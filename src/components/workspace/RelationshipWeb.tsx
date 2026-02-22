'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Users, Info, Settings } from 'lucide-react';
import styles from './RelationshipWeb.module.css';

// Initial nodes mapped to the Sci-Fi example from the beat board
const initialNodes: Node[] = [
    {
        id: '1',
        type: 'default',
        data: { label: 'Captain Aris' },
        position: { x: 250, y: 150 },
        className: `${styles.charNode} ${styles.charNodeProtag}`,
    },
    {
        id: '2',
        type: 'default',
        data: { label: 'Mira (Engineer)' },
        position: { x: 100, y: 300 },
        className: `${styles.charNode} ${styles.charNodeAlly}`,
    },
    {
        id: '3',
        type: 'default',
        data: { label: 'The Hegemony' },
        position: { x: 400, y: 300 },
        className: `${styles.charNode} ${styles.charNodeAntag}`,
    },
    {
        id: '4',
        type: 'default',
        data: { label: 'Xol Colony' },
        position: { x: 250, y: 450 },
        className: styles.charNode,
    }
];

const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: 'Trusts',
        animated: true,
        style: { stroke: 'var(--tag-blue-text)' },
    },
    {
        id: 'e1-3',
        source: '3',
        target: '1',
        label: 'Hunted By',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#c92a2a' },
        style: { stroke: '#c92a2a' },
    },
    {
        id: 'e1-4',
        source: '1',
        target: '4',
        label: 'Investigating',
        animated: true,
    }
];

export default function RelationshipWeb() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 2: Character Lab & Relationships</h1>
                <p className={styles.subtitle}>Map character alliances, rivalries, and plot intersection points.</p>
            </div>

            <div className={styles.workspaceArea}>
                <div className={styles.flowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={() => setSelectedNodeId(null)}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background color="#ccc" gap={16} />
                        <Controls />
                        <MiniMap
                            nodeStrokeColor={(n) => {
                                if (n.className?.includes('Protag')) return 'var(--accent-terracotta)';
                                if (n.className?.includes('Antag')) return '#c92a2a';
                                return '#eee';
                            }}
                            nodeColor={(n) => {
                                if (n.className?.includes('Protag')) return '#fffafa';
                                if (n.className?.includes('Antag')) return '#fff4f4';
                                return '#fff';
                            }}
                        />
                    </ReactFlow>
                </div>

                {/* Right Sidebar: Dynamic Inspector */}
                <div className={styles.sidebar}>
                    <div className={styles.infoPanel}>
                        <div className={styles.panelTitle}>
                            <span><Info size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Inspector</span>
                        </div>

                        {selectedNode ? (
                            <div className={styles.panelContent}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>
                                    {selectedNode.data.label}
                                </h3>

                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>Role</span>
                                    <span className={styles.statVal}>
                                        {selectedNode.className?.includes('Protag') ? 'Protagonist' :
                                            selectedNode.className?.includes('Antag') ? 'Antagonist' :
                                                selectedNode.className?.includes('Ally') ? 'Ally' : 'Setting/Faction'}
                                    </span>
                                </div>

                                <div className={styles.statRow}>
                                    <span className={styles.statLabel}>Mentions</span>
                                    <span className={styles.statVal}>{Math.floor(Math.random() * 50) + 12} times</span>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <strong>AI Synopsis:</strong>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                        {selectedNode.data.label === 'Captain Aris' ?
                                            "A hardened veteran of the Hegemony Wars. Aris is driven by a deep sense of guilt over the colonies abandoned during the retreat. Currently leading a splinter crew on a stolen frigate." :
                                            "Entity details stored in Vector Database. Select 'Chat with Character' to dive deeper."}
                                    </p>
                                </div>

                                <button className={styles.actionBtn}>
                                    Chat with Persona
                                </button>
                                <button className={styles.actionBtn} style={{ marginTop: '0.5rem', background: 'transparent' }}>
                                    Edit Lore Database
                                </button>
                            </div>
                        ) : (
                            <div className={styles.panelContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                                <Users size={48} style={{ marginBottom: '1rem' }} />
                                <p style={{ textAlign: 'center' }}>Select a character or faction node on the canvas to inspect their database entry.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
