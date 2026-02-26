'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Code, Terminal, ChevronRight, Hash, FileText, Zap, Book, ShieldAlert, Layers } from 'lucide-react';
import styles from './docs.module.css';

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('quickstart');

    return (
        <div className={styles.container}>
            {/* Nav */}
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                        <BookOpen className={styles.logoIcon} size={24} />
                        <span className={styles.logoText}>Versana Docs</span>
                    </Link>
                    <div className={styles.searchBox}>
                        <Search size={16} />
                        <input type="text" placeholder="Search documentation..." />
                        <span className={styles.shortcut}>⌘K</span>
                    </div>
                </div>
                <div className={styles.navLinks}>
                    <Link href="/features" className={styles.navLink}>Platform</Link>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/workspace" className={styles.ctaButtonPrimary}>
                        Launch App
                    </Link>
                </div>
            </nav>

            <div className={styles.layout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarGroup}>
                        <h4 className={styles.groupTitle}>Getting Started</h4>
                        <button className={`${styles.sidebarItem} ${activeSection === 'quickstart' ? styles.active : ''}`} onClick={() => setActiveSection('quickstart')}>
                            <Zap size={16} /> Quickstart Guide
                        </button>
                        <button className={`${styles.sidebarItem} ${activeSection === 'architecture' ? styles.active : ''}`} onClick={() => setActiveSection('architecture')}>
                            <Book size={16} /> Core Concepts
                        </button>
                    </div>

                    <div className={styles.sidebarGroup}>
                        <h4 className={styles.groupTitle}>Context Matrix</h4>
                        <button className={styles.sidebarItem}><Code size={16} /> Vector Indexing</button>
                        <button className={styles.sidebarItem}><Terminal size={16} /> API Integration</button>
                        <button className={styles.sidebarItem}><ShieldAlert size={16} /> Fact Checking Auth</button>
                        <button className={styles.sidebarItem}><FileText size={16} /> Document Sync</button>
                    </div>

                    <div className={styles.sidebarGroup}>
                        <h4 className={styles.groupTitle}>Workflow Phases</h4>
                        <button className={styles.sidebarItem}><Hash size={14} /> 1. Ideation</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 2. Kanbans & Outlining</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 3. Deep Research</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 4. Chapter Drafting</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 5. Deep Edits</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 6. Nano Banana Pro</button>
                        <button className={styles.sidebarItem}><Hash size={14} /> 7. ePub Typesetting</button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={styles.content}>
                    <div className={styles.breadcrumbs}>
                        <span>Docs</span> <ChevronRight size={14} />
                        <span className={styles.currentCrumb}>
                            {activeSection === 'quickstart' ? 'Quickstart Guide' : 'Core Architecture'}
                        </span>
                    </div>

                    {activeSection === 'quickstart' ? (
                        <>
                            <h1 className={styles.pageTitle}>Quickstart Guide</h1>
                            <p className={styles.lede}>
                                Get up and running with Versana&apos;s persistent Context Matrix memory in under 5 minutes. Learn how to seed your universe and let the AI build memory vectors.
                            </p>

                            <hr className={styles.divider} />

                            <h2 id="initialization" className={styles.heading2}>1. Initialize the Matrix</h2>
                            <p className={styles.paragraph}>
                                Standard writing applications require you to manage multiple docs for your character bibles, world maps, and relationship webs. Relational vector databases have made this obsolete.
                            </p>
                            <div className={styles.callout}>
                                <strong>Tip:</strong> Don&apos;t try to build the database from scratch. Start writing in Phase 4 first, and let the background cron job auto-extract your Lore.
                            </div>

                            <p className={styles.paragraph}>
                                To manually bypass auto-extraction and seed your own database, use the following API architecture if building programmatically:
                            </p>

                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>bash</span>
                                    <button>Copy</button>
                                </div>
                                <pre>
                                    <code>{`# Authenticate your terminal
versana login --token YOUR_API_TOKEN

# Bulk upload your markdown world-building files
versana matrix parse ./my-scifi-novel/reference/

# Verify ingestion statuses
versana matrix status
> 142 Vectors Indexed. Dimensionality: 1536.`}
                                    </code>
                                </pre>
                            </div>

                            <h2 id="smart-tags" className={styles.heading2}>2. Using Smart Tags in the Editor</h2>
                            <p className={styles.paragraph}>
                                While drafting in Phase 4, you can explicitly call upon the Matrix by typing <code>@</code> followed by the Lore element&apos;s name. This pins the semantic meaning to the local token window, ensuring the co-pilot remembers it for the duration of the chapter.
                            </p>

                            <div className={styles.exampleCard}>
                                <div className={styles.exampleHeader}>
                                    <div className={styles.dot} style={{ background: '#ef4444' }} />
                                    <div className={styles.dot} style={{ background: '#f59e0b' }} />
                                    <div className={styles.dot} style={{ background: '#22c55e' }} />
                                </div>
                                <div className={styles.exampleBody}>
                                    &quot;I can&apos;t believe <span className={styles.highlightToken}>@Aris</span> forgot the access codes to the <span className={styles.highlightToken}>@Pyria Amulet</span>!&quot;
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <h1 className={styles.pageTitle}>Core Architectural Concepts</h1>
                            <p className={styles.lede}>
                                A deep dive into the vectorization pipeline and why standard LLMs fail at 90,000 word contexts.
                            </p>

                            <hr className={styles.divider} />

                            <h2 className={styles.heading2}>The &quot;Amnesia&quot; Problem</h2>
                            <p className={styles.paragraph}>
                                When you feed an LLM 100,000 words, it suffers from &quot;lost in the middle&quot; syndrome. It might remember the first chapter and the last chapter, but it will blur the details in between. That&apos;s why Versana strictly utilizes a <strong>Retrieval Augmented Generation (RAG)</strong> stack tied directly into a TipTap unstyled text editor.
                            </p>

                            <div className={styles.gridCards}>
                                <div className={styles.gridCard}>
                                    <div className={styles.cardHeader}>
                                        <Zap size={18} color="var(--tag-blue-text)" />
                                        <h4>Embedding Phase</h4>
                                    </div>
                                    <p>We use text-embedding-ada-002 to map every sentence into 1536-dimensional space.</p>
                                </div>
                                <div className={styles.gridCard}>
                                    <div className={styles.cardHeader}>
                                        <Layers size={18} color="var(--tag-purple-text)" />
                                        <h4>Similarity Search</h4>
                                    </div>
                                    <p>Upon Co-Pilot requests, we perform a cosine-similarity check via pgvector in Supabase.</p>
                                </div>
                            </div>
                        </>
                    )}


                    <div className={styles.footerNav}>
                        <button className={styles.footerBtn}>
                            <span className={styles.footerLabel}>Previous</span>
                            <span className={styles.footerVal}>Introduction</span>
                        </button>
                        <button className={styles.footerBtn} style={{ textAlign: 'right' }}>
                            <span className={styles.footerLabel}>Next</span>
                            <span className={styles.footerVal}>Vector Indexing <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></span>
                        </button>
                    </div>
                </main>

                {/* Right Sidebar: Table of Contents */}
                <aside className={styles.tocSidebar}>
                    <h5 className={styles.tocTitle}>On this page</h5>
                    <ul className={styles.tocList}>
                        {activeSection === 'quickstart' ? (
                            <>
                                <li><a href="#initialization" className={styles.tocLinkActive}>Initialize the Matrix</a></li>
                                <li><a href="#smart-tags" className={styles.tocLink}>Using Smart Tags</a></li>
                                <li><a href="#typesetting" className={styles.tocLink}>Automated Typesetting</a></li>
                            </>
                        ) : (
                            <>
                                <li><a href="#intro" className={styles.tocLinkActive}>The Amnesia Problem</a></li>
                                <li><a href="#embedding" className={styles.tocLink}>Vector Pipeline</a></li>
                            </>
                        )}
                    </ul>
                </aside>
            </div>
        </div>
    );
}
