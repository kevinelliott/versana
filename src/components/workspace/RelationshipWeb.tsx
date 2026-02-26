'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import { Users, Info, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
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
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const [isChatting, setIsChatting] = useState(false);
    const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = selectedNodeId ? (isNonFicProject ? `Act as an expert on ${nodes.find(n => n.id === selectedNodeId)?.data.label}. Respond comprehensively based on the project's knowledge base.` : `Act as ${nodes.find(n => n.id === selectedNodeId)?.data.label}, a character in my story. Respond in character based on the author's worldbuilding. Keep your responses concise and engaging.`) : '';

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    workspaceId: activeWorkspace?.id,
                    systemPrompt
                })
            });

            if (!res.ok) throw new Error("API response error");

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const newArray = [...prev];
                    const lastIndex = newArray.length - 1;
                    if (newArray[lastIndex] && newArray[lastIndex].id === aiMsgId) {
                        newArray[lastIndex] = { ...newArray[lastIndex], content: newArray[lastIndex].content + chunk };
                    }
                    return newArray;
                });
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Connection error while communicating with character.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
        setIsChatting(false);
        setMessages([]); // reset chat for new character
    };

    // Load state
    useEffect(() => {
        if (activeWorkspace?.board_state?.relationshipWeb) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rw = activeWorkspace.board_state.relationshipWeb as any;
            if (rw.nodes && rw.nodes.length > 0) setNodes(rw.nodes);
            if (rw.edges && rw.edges.length > 0) setEdges(rw.edges);
        } else if (isNonFicProject) {
            setNodes([
                { id: '1', type: 'default', data: { label: 'Primary Thesis' }, position: { x: 250, y: 150 }, className: `${styles.charNode} ${styles.charNodeProtag}` },
                { id: '2', type: 'default', data: { label: 'Sub-Argument A' }, position: { x: 100, y: 300 }, className: `${styles.charNode} ${styles.charNodeAlly}` },
                { id: '3', type: 'default', data: { label: 'Counterargument' }, position: { x: 400, y: 300 }, className: `${styles.charNode} ${styles.charNodeAntag}` },
                { id: '4', type: 'default', data: { label: 'Case Study 1' }, position: { x: 250, y: 450 }, className: styles.charNode }
            ]);
            setEdges([
                { id: 'e1-2', source: '1', target: '2', label: 'Supported By', animated: true, style: { stroke: 'var(--tag-blue-text)' } },
                { id: 'e1-3', source: '3', target: '1', label: 'Challenges', markerEnd: { type: MarkerType.ArrowClosed, color: '#c92a2a' }, style: { stroke: '#c92a2a' } },
                { id: 'e2-4', source: '2', target: '4', label: 'Evidence', animated: true }
            ]);
        }
    }, [activeWorkspace?.board_state, isNonFicProject, setNodes, setEdges]);

    // Save state (Debounced)
    useEffect(() => {
        if (!activeWorkspace) return;

        const saveWeb = async () => {
            try {
                const updatedBoardState = {
                    ...(activeWorkspace.board_state || {}),
                    relationshipWeb: { nodes, edges }
                };
                await fetch(`/api/workspaces/${activeWorkspace.id}/board`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ board_state: updatedBoardState })
                });
                setActiveWorkspace({ ...activeWorkspace, board_state: updatedBoardState });
            } catch (err) {
                console.error("Failed to save relationship web:", err);
            }
        };

        const timer = setTimeout(() => {
            saveWeb();
        }, 2000);

        return () => clearTimeout(timer);
    }, [nodes, edges, activeWorkspace, setActiveWorkspace]);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isNonFicProject ? 'Conceptual Map & Variables' : 'Phase 2: Character Lab & Relationships'}</h1>
                <p className={styles.subtitle}>{isNonFicProject ? 'Map arguments, processes, and interconnected concepts.' : 'Map character alliances, rivalries, and plot intersection points.'}</p>
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
                            <div className={styles.panelContent} style={{ display: 'flex', flexDirection: 'column' }}>
                                {isChatting ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <button className={styles.backBtn} onClick={() => setIsChatting(false)}>
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {selectedNode.data.label}
                                            </span>
                                        </div>

                                        <div className={styles.chatContainer}>
                                            <div className={styles.chatMessages}>
                                                {messages.length === 0 && (
                                                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 'auto', marginBottom: 'auto' }}>
                                                        {isNonFicProject ? `Explore the concept of ${selectedNode.data.label}...` : `Start chatting with ${selectedNode.data.label}...`}
                                                    </p>
                                                )}
                                                {messages.map((m: { id: string, role: string, content: string }) => (
                                                    <div key={m.id} className={`${styles.chatMessage} ${m.role === 'user' ? styles.messageUser : styles.messageAi}`}>
                                                        {m.content}
                                                    </div>
                                                ))}
                                                {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                                                    <div className={`${styles.chatMessage} ${styles.messageAi}`}>...</div>
                                                )}
                                            </div>

                                            <form onSubmit={handleSubmit} className={styles.chatInputGroup}>
                                                <input
                                                    className={styles.chatInput}
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    placeholder="Ask something..."
                                                />
                                                <button type="submit" className={styles.chatSendBtn} disabled={isLoading || !input.trim()}>
                                                    <Send size={16} />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>
                                            {selectedNode.data.label}
                                        </h3>

                                        <div className={styles.statRow}>
                                            <span className={styles.statLabel}>Role</span>
                                            <span className={styles.statVal}>
                                                {isNonFicProject ? (
                                                    selectedNode.className?.includes('Protag') ? 'Primary Thesis' :
                                                        selectedNode.className?.includes('Antag') ? 'Counterargument' :
                                                            selectedNode.className?.includes('Ally') ? 'Supporting Evidence' : 'Related Concept'
                                                ) : (
                                                    selectedNode.className?.includes('Protag') ? 'Protagonist' :
                                                        selectedNode.className?.includes('Antag') ? 'Antagonist' :
                                                            selectedNode.className?.includes('Ally') ? 'Ally' : 'Setting/Faction'
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.statRow}>
                                            <span className={styles.statLabel}>Mentions</span>
                                            <span className={styles.statVal}>{Math.floor(Math.random() * 50) + 12} times</span>
                                        </div>

                                        <div style={{ marginTop: '1.5rem' }}>
                                            <strong>AI Synopsis:</strong>
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                                {isNonFicProject ? (
                                                    selectedNode.data.label === 'Captain Aris' ?
                                                        "A primary driver of growth in the modern technological landscape. Exploring this concept involves analyzing key drivers." :
                                                        "Entity details stored in Vector Database. Select 'Chat with Concept' to dive deeper."
                                                ) : (
                                                    selectedNode.data.label === 'Captain Aris' ?
                                                        "A hardened veteran of the Hegemony Wars. Aris is driven by a deep sense of guilt over the colonies abandoned during the retreat. Currently leading a splinter crew on a stolen frigate." :
                                                        "Entity details stored in Vector Database. Select 'Chat with Character' to dive deeper."
                                                )}
                                            </p>
                                        </div>

                                        <button className={styles.actionBtn} onClick={() => setIsChatting(true)}>
                                            <MessageSquare size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                            {isNonFicProject ? 'Chat with Concept' : 'Chat with Persona'}
                                        </button>
                                        <button className={styles.actionBtn} style={{ marginTop: '0.5rem', background: 'transparent' }}>
                                            {isNonFicProject ? 'Edit Knowledge Base' : 'Edit Lore Database'}
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className={styles.panelContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                                <Users size={48} style={{ marginBottom: '1rem' }} />
                                <p style={{ textAlign: 'center' }}>{isNonFicProject ? 'Select a concept or data point node on the canvas to inspect its database entry.' : 'Select a character or faction node on the canvas to inspect their database entry.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
