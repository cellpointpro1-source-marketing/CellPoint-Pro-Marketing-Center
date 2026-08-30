import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Archive, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, Copy, FileImage, FolderOpen, Gauge, Hash, ImagePlus,
  Info, Instagram, LayoutTemplate, Link2, ListFilter, Menu, MessageCircle,
  MoreHorizontal, Pencil, Play, Plus, RefreshCw, Search, Send, Settings2,
  Sparkles, Store, Trash2, Upload, Users, Video, X, Youtube, Zap,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { getPosLaunchErrorCopy, resolvePosLaunch, type PosLaunchStoreContext } from '@/services/pos-launch';

const queryClient = new QueryClient();

type Status = 'draft' | 'scheduled' | 'published' | 'failed';
type Platform = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'Google Business';
type MediaItem = { id: number; name: string; type: string; folder: string; dimensions: string; size: string; color: string };
type Post = { id: number; caption: string; platforms: Platform[]; media: MediaItem; status: Status; scheduledAt?: string; publishedAt?: string };
type Promotion = { id: number; name: string; description: string; startDate: string; endDate: string; price: string; discount: string; cta: string };

const platforms: Platform[] = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Google Business'];
const platformShort: Record<Platform, string> = { Facebook: 'f', Instagram: 'ig', TikTok: 'tk', YouTube: 'yt', 'Google Business': 'gb' };
const platformClass: Record<Platform, string> = { Facebook: 'channel-fb', Instagram: 'channel-ig', TikTok: 'channel-tk', YouTube: 'channel-yt', 'Google Business': 'channel-gb' };

const initialMedia: MediaItem[] = [
  { id: 1, name: 'Spring trade-in counter', type: 'Image', folder: 'Storefront', dimensions: '1600 × 1200', size: '1.8 MB', color: 'linear-gradient(135deg,#c59a70,#dfc9ae 48%,#304c70 49%,#243c5d)' },
  { id: 2, name: 'iPhone 15 Pro in hand', type: 'Image', folder: 'Product shots', dimensions: '1200 × 1500', size: '1.2 MB', color: 'linear-gradient(145deg,#bac3c8,#ece4d2 48%,#e7a341 49%,#bd7120)' },
  { id: 3, name: 'Meet the repair team', type: 'Image', folder: 'Team', dimensions: '1600 × 1067', size: '2.4 MB', color: 'linear-gradient(135deg,#314c6e,#7188a0 47%,#d7a05c 48%,#9c6530)' },
  { id: 4, name: 'Weekend accessory wall', type: 'Image', folder: 'Storefront', dimensions: '1600 × 1067', size: '1.7 MB', color: 'linear-gradient(125deg,#f3c46f,#d78b33 45%,#49657a 46%,#263e5b)' },
  { id: 5, name: 'Screen repair close-up', type: 'Video', folder: 'Services', dimensions: '1080 × 1920', size: '8.6 MB', color: 'linear-gradient(135deg,#e2d2bd,#ab856a 45%,#27486e 46%,#182b47)' },
  { id: 6, name: 'Pixel 8a color lineup', type: 'Image', folder: 'Product shots', dimensions: '1600 × 1200', size: '1.4 MB', color: 'linear-gradient(135deg,#d6c9b6,#a8b2ae 49%,#dc9949 50%,#8d5425)' },
  { id: 7, name: 'Local delivery van', type: 'Image', folder: 'Storefront', dimensions: '1600 × 1067', size: '1.5 MB', color: 'linear-gradient(135deg,#294565,#577893 49%,#dfae64 50%,#e6cfaa)' },
  { id: 8, name: 'Accessory bundle flatlay', type: 'Image', folder: 'Product shots', dimensions: '1200 × 1200', size: '980 KB', color: 'linear-gradient(135deg,#d5a160,#f1d7b5 50%,#2c4664 51%,#63819a)' },
];

const initialPosts: Post[] = [
  { id: 101, caption: 'Trade in your old phone and walk out with an upgrade that fits your life. Ask our team what your device is worth.', platforms: ['Facebook', 'Instagram'], media: initialMedia[0], status: 'published', publishedAt: 'Today, 9:14 AM' },
  { id: 102, caption: 'Fresh glass, same phone. Our repair desk is ready for cracked screens, battery swaps, and the little fixes that keep you moving.', platforms: ['Instagram', 'Google Business'], media: initialMedia[4], status: 'scheduled', scheduledAt: 'Tomorrow, 10:30 AM' },
  { id: 103, caption: 'Three accessories we always keep within reach: a braided cable, a real case, and a charger for the road.', platforms: ['TikTok'], media: initialMedia[7], status: 'draft' },
  { id: 104, caption: 'Need a phone today? We have options for every budget, with honest advice from people who live here too.', platforms: ['Facebook'], media: initialMedia[6], status: 'failed', publishedAt: 'Yesterday, 4:06 PM' },
  { id: 105, caption: 'The weekend is for getting connected. Stop by Riverbend Wireless for a quick setup and a better plan.', platforms: ['Facebook', 'Instagram', 'TikTok'], media: initialMedia[3], status: 'scheduled', scheduledAt: 'Sat, Jun 22 · 11:00 AM' },
];

const initialPromotions: Promotion[] = [
  { id: 201, name: 'Summer upgrade event', description: 'Bring in any working smartphone and get extra value toward an in-stock upgrade.', startDate: 'Jun 14, 2024', endDate: 'Jun 30, 2024', price: '$100', discount: 'extra trade-in value', cta: 'Visit us this week' },
  { id: 202, name: 'Screen repair week', description: 'A little less glass, a lot more day. Save on same-day screen repairs this week.', startDate: 'Jun 17, 2024', endDate: 'Jun 23, 2024', price: '$79', discount: 'select models', cta: 'Book a repair' },
];

function iconFor(label: string) {
  const icons: Record<string, ReactNode> = { Overview: <Gauge />, 'Create post': <Plus />, Calendar: <CalendarDays />, 'Media library': <FolderOpen />, Templates: <LayoutTemplate />, Promotions: <Zap />, Analytics: <BarChart3 />, 'Social accounts': <Link2 />, Settings: <Settings2 /> };
  return icons[label];
}

const navPrimary = ['Overview', 'Create post', 'Calendar', 'Media library', 'Templates', 'Promotions', 'Analytics'];
const navManage = ['Social accounts', 'Settings'];
const routeFor: Record<string, string> = { Overview: '/', 'Create post': '/create-post', Calendar: '/calendar', 'Media library': '/media-library', Templates: '/templates', Promotions: '/promotions', Analytics: '/analytics', 'Social accounts': '/social-accounts', Settings: '/settings' };

function Shell({ children, mobileOpen, setMobileOpen }: { children: ReactNode; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const [location] = useLocation();
  const currentLabel = Object.entries(routeFor).find(([, route]) => route === location)?.[0] ?? 'Overview';
  return (
    <div className="app-shell">
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-logo-wrap">
            <img src="/brand/cellpoint-pro-logo.png" alt="CellPoint Pro" data-testid="img-brand-logo" />
          </div>
          <div className="demo-badge"><span className="demo-dot" /> Demo mode</div>
        </div>
        <div className="nav-section">Workspace</div>
        <nav>
          {navPrimary.map((item) => <Link key={item} href={routeFor[item]} className={`nav-link ${currentLabel === item ? 'active' : ''}`} data-testid={`link-nav-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)}>{iconFor(item)}<span>{item}</span></Link>)}
        </nav>
        <div className="nav-section">Manage</div>
        <nav>
          {navManage.map((item) => <Link key={item} href={routeFor[item]} className={`nav-link ${currentLabel === item ? 'active' : ''}`} data-testid={`link-nav-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)}>{iconFor(item)}<span>{item}</span></Link>)}
        </nav>
        <div className="sidebar-footer">
          <strong>Riverbend Wireless</strong>
          482 Market Street · Cedar Falls, IA
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><CircleHelp size={13} /> Need a hand? View guide</div>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button>
            <span className="crumb">{currentLabel}</span>
          </div>
          <div className="topbar-actions">
            <span className="topbar-note"><span style={{ color: '#38836a', fontWeight: 700 }}>●</span> Local demo data only</span>
            <button className="icon-button" aria-label="Notifications" data-testid="button-notifications"><Bell size={15} /></button>
            <div className="avatar" data-testid="avatar-user">JM</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p className="subheading">{description}</p>}</div>{action}</div>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status status-${status}`} data-testid={`status-${status}`}>{status}</span>;
}

function PlatformDots({ items }: { items: Platform[] }) {
  return <div style={{ display: 'flex', gap: 4 }}>{items.map((platform) => <span key={platform} className={`channel-icon ${platformClass[platform]}`} style={{ width: 21, height: 21, fontSize: 9 }} title={platform}>{platformShort[platform]}</span>)}</div>;
}

function Dashboard({ posts, launchContext }: { posts: Post[]; launchContext?: PosLaunchStoreContext }) {
  const recent = posts.slice(0, 4);
  const publishCount = posts.filter((p) => p.status === 'published').length;
  return <div className="content">
    <PageHeading eyebrow="Tuesday, June 18, 2024" title="Make today’s post count." description="A clear view of what is moving, what is next, and where your store can show up today." action={<Link href="/create-post" className="button button-primary" data-testid="link-create-post"><Plus size={15} /> Create a post</Link>} />
     {launchContext && <div className="launch-context"><div className="launch-context-icon"><Store size={17} /></div><div><strong>{launchContext.storeName} · Demo store</strong><span>Opened from the CellPoint Pro POS browser launch. This temporary demo context is not secure authentication.</span></div><span className="tag">storeId: {launchContext.storeId}</span></div>}
     <div className="demo-callout"><Info size={16} /><span><strong>Demo mode is on.</strong> Everything here is sample store activity saved in this browser. Social accounts are not connected and analytics are illustrative.</span></div>
    <div className="metric-grid">
      {[['Posts this month', String(publishCount + 8), '+3 from last month'], ['Scheduled next', String(posts.filter((p) => p.status === 'scheduled').length), 'Ready for review'], ['Content ready', '12', 'Across 4 categories'], ['Engagement rate', '6.8%', 'Demo data']].map(([label, value, foot], index) => <div className="card metric-card" key={label} data-testid={`metric-card-${index}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`metric-foot ${index === 3 ? 'neutral' : ''}`}>{foot}</div></div>)}
    </div>
    <div className="dashboard-grid">
      <section className="card card-pad">
        <div className="section-head"><div><h2>Recent activity</h2><p>The latest moves in your content queue.</p></div><Link href="/calendar" className="text-link" data-testid="link-view-calendar">View calendar <ArrowUpRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div>
        {recent.map((post) => <div className="activity-row" key={post.id} data-testid={`activity-row-${post.id}`}><div className="activity-thumb" style={{ background: post.media.color }} /><div className="activity-main"><strong>{post.caption}</strong><span>{post.status === 'published' ? post.publishedAt : post.status === 'scheduled' ? post.scheduledAt : 'Saved to drafts'} · {post.platforms.join(', ')}</span></div><StatusBadge status={post.status} /></div>)}
      </section>
      <div style={{ display: 'grid', gap: 14 }}>
        <section className="card card-pad quick-create"><div className="eyebrow">Keep the queue warm</div><h2>What should you share next?</h2><p>Start with a proven store moment, then make it yours. You are always in control before anything goes live.</p><Link href="/templates" className="button button-primary" data-testid="link-browse-templates">Browse templates <ArrowUpRight size={14} /></Link></section>
        <section className="card card-pad"><div className="section-head"><div><h2>Channels at a glance</h2><p>Connection states are simulated.</p></div><Link href="/social-accounts" className="text-link" data-testid="link-manage-accounts">Manage</Link></div><div className="channel-list">{platforms.slice(0, 4).map((p) => <div className="channel-row" key={p}><span className={`channel-icon ${platformClass[p]}`}>{platformShort[p]}</span><div><strong>{p}</strong><span>@riverbendwireless</span></div><span className="channel-state">Demo</span></div>)}</div></section>
      </div>
    </div>
    <section className="card card-pad" style={{ marginTop: 14 }}><div className="section-head"><div><h2>Posting rhythm</h2><p>Posts published across the last seven demo days.</p></div><span className="tag">Last 7 days</span></div><div className="bar-chart">{[42, 65, 34, 78, 52, 88, 61].map((height, i) => <div className="bar" style={{ height: `${height}%` }} key={i} />)}</div><div className="bar-labels"><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span></div></section>
  </div>;
}

function SocialAccounts({ setToast }: { setToast: (message: string) => void }) {
  const [connected, setConnected] = useState<Record<string, boolean>>({ Facebook: true, Instagram: true, TikTok: false, YouTube: false, 'Google Business': true });
  return <div className="content"><PageHeading eyebrow="Connections" title="Your channels, your call." description="Connect accounts when you are ready. In Demo Mode, buttons change the local status only—nothing is posted or synced." />
    <div className="demo-callout"><Info size={16} /><span>These are simulated connection states for previewing your workflow. No credentials are requested or stored.</span></div>
    <div className="social-grid">{platforms.map((p) => <section className="card social-card" key={p}><span className={`channel-icon ${platformClass[p]}`}>{platformShort[p]}</span><div className="social-card-main"><strong>{p}</strong><p>{connected[p] ? '@riverbendwireless · Demo connection' : 'Not connected · ready when you are'}</p><button className={`button ${connected[p] ? 'button-ghost' : 'button-primary'}`} onClick={() => { setConnected((old) => ({ ...old, [p]: !old[p] })); setToast(connected[p] ? `${p} disconnected in demo mode.` : `${p} connected in demo mode.`); }} data-testid={`button-toggle-${p.toLowerCase().replaceAll(' ', '-')}`}>{connected[p] ? 'Disconnect' : 'Connect demo account'}</button></div><div><span className={`status ${connected[p] ? 'status-published' : 'status-draft'}`}>{connected[p] ? 'Connected' : 'Not connected'}</span></div></section>)}</div>
    <section className="card card-pad" style={{ marginTop: 14 }}><div className="section-head"><div><h2>How connections work</h2><p>When this workspace leaves demo mode, you will choose exactly which channels to publish to.</p></div><CircleHelp size={19} color="#c97918" /></div><div className="connection-note">CellPoint Pro never publishes without an explicit action. Every post has a review step, and account permissions can be changed at any time.</div></section>
  </div>;
}

function Composer({ media, onSave, setToast, initialCaption = '', initialMedia }: { media: MediaItem[]; onSave: (post: Post) => void; setToast: (message: string) => void; initialCaption?: string; initialMedia?: MediaItem }) {
  const [caption, setCaption] = useState(initialCaption);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Facebook', 'Instagram']);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(initialMedia ?? media[0]);
  const [tone, setTone] = useState('Warm');
  const [brief, setBrief] = useState('');
  const [generated, setGenerated] = useState({ headline: 'A better way to stay connected', caption: 'Your next upgrade should feel simple. Stop by Riverbend Wireless for honest advice, helpful options, and a team that knows your neighborhood.', hashtags: '#RiverbendWireless #StayConnected #LocalStore', cta: 'Visit us today' });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState('2024-06-21T10:30');
  const togglePlatform = (platform: Platform) => setSelectedPlatforms((old) => old.includes(platform) ? old.filter((item) => item !== platform) : [...old, platform]);
  const useGenerated = () => { setCaption(`${generated.headline}\n\n${generated.caption}\n\n${generated.hashtags}\n${generated.cta}`); setToast('CellPoint AI copy added to your draft. Review before publishing.'); };
  const save = (status: Status, scheduledAt?: string) => { onSave({ id: Date.now(), caption: caption || generated.caption, platforms: selectedPlatforms.length ? selectedPlatforms : ['Facebook'], media: selectedMedia, status, scheduledAt: scheduledAt ? new Date(scheduledAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : undefined, publishedAt: status === 'published' ? 'Just now' : undefined }); setToast(status === 'published' ? 'Published in demo mode. Nothing was sent to a live account.' : status === 'scheduled' ? 'Post scheduled in demo mode.' : 'Draft saved to your calendar.'); };
  return <div className="content"><PageHeading eyebrow="Content studio" title="Make a post." description="Choose the moment, make it sound like your store, and review every detail before it leaves the building." action={<span className="status status-draft">Approval required</span>} />
    <div className="composer-grid">
      <div>
        <section className="card card-pad"><div className="section-head"><div><h2>Post details</h2><p>One idea, adapted for each selected channel.</p></div><span className="tag">{caption.length}/2,200</span></div><div className="field"><label htmlFor="caption">Caption</label><textarea id="caption" rows={8} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What is happening at your store today?" data-testid="textarea-post-caption" /></div><div className="field" style={{ marginTop: 16 }}><label>Publish to</label><div className="platform-pills">{platforms.map((p) => <button key={p} className={`platform-pill ${selectedPlatforms.includes(p) ? 'selected' : ''}`} onClick={() => togglePlatform(p)} data-testid={`button-platform-${p.toLowerCase().replaceAll(' ', '-')}`}>{platformShort[p]} {p}</button>)}</div></div><div className="field" style={{ marginTop: 16 }}><label>Media</label><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 56, height: 56, borderRadius: 7, background: selectedMedia.color }} /><div><strong style={{ fontSize: 12 }}>{selectedMedia.name}</strong><div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11, marginTop: 3 }}>{selectedMedia.dimensions} · {selectedMedia.size}</div></div><button className="button button-ghost" style={{ marginLeft: 'auto' }} onClick={() => setSelectedMedia(media[(media.findIndex((item) => item.id === selectedMedia.id) + 1) % media.length])} data-testid="button-change-media"><ImagePlus size={14} /> Change</button></div></div></section>
        <section className="ai-panel"><div className="ai-head"><div><div className="ai-title"><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> CellPoint AI</div><div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11, marginTop: 4 }}>Approval-first help for the blank-page moment.</div></div><span className="tag">Draft only</span></div><div className="tone-row">{['Warm', 'Direct', 'Playful', 'Helpful'].map((item) => <button className={`tone ${tone === item ? 'selected' : ''}`} key={item} onClick={() => setTone(item)} data-testid={`button-tone-${item.toLowerCase()}`}>{item}</button>)}</div><div style={{ display: 'flex', gap: 7 }}><input value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. promote our $79 screen repair week" style={{ flex: 1 }} data-testid="input-ai-brief" /><button className="button button-ink" onClick={() => { setGenerated((old) => ({ ...old, headline: brief ? brief.slice(0, 42) : `A ${tone.toLowerCase()} reason to stop by` })); setToast('CellPoint AI generated a fresh suggestion.'); }} data-testid="button-generate-ai"><Sparkles size={14} /> Generate</button></div><div className="generated-copy"><strong>{generated.headline}</strong><p>{generated.caption}</p><div style={{ color: '#b86d13', fontSize: 11, marginTop: 7 }}>{generated.hashtags} · {generated.cta}</div><div style={{ display: 'flex', gap: 7, marginTop: 12 }}><button className="button button-primary" onClick={useGenerated} data-testid="button-use-ai-copy">Use this copy</button><button className="button button-ghost" onClick={() => setGenerated((old) => ({ ...old, caption: 'Small store, serious service. We will help you find the right phone, fix what is broken, and leave with a plan that makes sense.' }))} data-testid="button-regenerate-ai"><RefreshCw size={14} /> Regenerate</button></div></div></section>
        <div className="form-actions"><button className="button button-ghost" onClick={() => save('draft')} data-testid="button-save-draft">Save draft</button><button className="button button-ghost" onClick={() => setScheduleOpen(true)} data-testid="button-open-schedule"><Clock3 size={14} /> Schedule</button><button className="button button-primary" onClick={() => save('published')} data-testid="button-publish-now"><Send size={14} /> Publish now</button></div>
      </div>
      <section className="card card-pad"><div className="section-head"><div><h2>Preview</h2><p>Instagram-style demo preview</p></div><PlatformDots items={selectedPlatforms} /></div><div className="preview-phone"><div className="phone-top"><span>10:24</span><span>● ● ●</span></div><div className="preview-post"><div className="preview-post-header"><div className="avatar">RW</div><span>riverbendwireless</span><MoreHorizontal size={13} style={{ marginLeft: 'auto' }} /></div><div className="preview-post-image" style={{ background: selectedMedia.color }} /><div className="preview-post-copy"><strong>{caption.split('\n')[0] || generated.headline}</strong><span>{caption.split('\n').slice(1).join(' ') || generated.caption}</span></div></div></div></section>
    </div>
    {scheduleOpen && <div className="modal-backdrop" onClick={() => setScheduleOpen(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>Schedule this post</h2><button className="close" onClick={() => setScheduleOpen(false)} data-testid="button-close-schedule"><X /></button></div><div className="modal-body"><p className="subheading" style={{ margin: 0 }}>Pick a time to place this in your demo calendar. You can change it later.</p><div className="field" style={{ marginTop: 18 }}><label htmlFor="schedule-date">Date and time</label><input id="schedule-date" type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} data-testid="input-schedule-date" /></div><div className="form-actions"><button className="button button-ghost" onClick={() => setScheduleOpen(false)} data-testid="button-cancel-schedule">Cancel</button><button className="button button-primary" onClick={() => { save('scheduled', schedule); setScheduleOpen(false); }} data-testid="button-confirm-schedule"><CalendarDays size={14} /> Schedule post</button></div></div></div></div>}
  </div>;
}

function CalendarPage({ posts, setPosts, setToast, media }: { posts: Post[]; setPosts: (posts: Post[]) => void; setToast: (message: string) => void; media: MediaItem[] }) {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [openPost, setOpenPost] = useState<Post | null>(null);
  const shown = filter === 'all' ? posts : posts.filter((p) => p.status === filter);
  const remove = (id: number) => { setPosts(posts.filter((post) => post.id !== id)); setOpenPost(null); setToast('Post deleted from demo calendar.'); };
  return <div className="content"><PageHeading eyebrow="Publishing queue" title="Calendar" description="A calm place to see what is ready, what is next, and what needs another look." action={<Link href="/create-post" className="button button-primary" data-testid="link-calendar-create"><Plus size={15} /> Create a post</Link>} /><div className="toolbar"><div className="status" style={{ background: '#fff3dc', color: '#a96716' }}><CalendarDays size={13} /> June 2024</div><select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | Status)} className="select" data-testid="select-calendar-filter"><option value="all">All posts</option><option value="draft">Drafts</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="failed">Failed</option></select></div><div className="split-layout"><section className="card card-pad"><div className="section-head"><div><h2>{filter === 'all' ? 'All demo posts' : `${filter[0].toUpperCase()}${filter.slice(1)} posts`}</h2><p>{shown.length} pieces of content in this view.</p></div><ListFilter size={18} color="#c97918" /></div>{shown.length ? shown.map((post) => <div className="post-card" key={post.id}><div className="activity-thumb" style={{ background: post.media.color }} /><div className="post-card-content"><strong>{post.caption}</strong><p>{post.status === 'scheduled' ? post.scheduledAt : post.status === 'published' ? post.publishedAt : post.status === 'failed' ? 'Could not publish · review connection' : 'Not scheduled'} </p></div><PlatformDots items={post.platforms} /><StatusBadge status={post.status} /><div className="post-actions"><button className="icon-button" onClick={() => setOpenPost(post)} aria-label="Open post details" data-testid={`button-open-post-${post.id}`}><ArrowUpRight /></button><button className="icon-button" onClick={() => { setPosts(posts.map((item) => item.id === post.id ? { ...item, status: item.status === 'draft' ? 'scheduled' : 'draft' } : item)); setToast('Post status updated in demo mode.'); }} aria-label="Toggle post status" data-testid={`button-toggle-post-${post.id}`}><RefreshCw /></button></div></div>) : <div className="empty"><Archive /><strong>No posts in this view yet</strong><p>Try another filter or create a new piece of store content.</p></div>}</section><section className="card card-pad"><div className="section-head"><div><h2>Publishing notes</h2><p>Keep your review habit simple.</p></div><Info size={18} color="#c97918" /></div><div style={{ display: 'grid', gap: 14 }}><div><span className="status status-draft">Draft</span><p style={{ marginTop: 7, color: 'hsl(var(--muted-foreground))', fontSize: 12, lineHeight: 1.5 }}>A safe place for ideas. Nothing can publish from here.</p></div><div><span className="status status-scheduled">Scheduled</span><p style={{ marginTop: 7, color: 'hsl(var(--muted-foreground))', fontSize: 12, lineHeight: 1.5 }}>A clear commitment to your calendar—not a live connection.</p></div><div><span className="status status-failed">Failed</span><p style={{ marginTop: 7, color: 'hsl(var(--muted-foreground))', fontSize: 12, lineHeight: 1.5 }}>A prompt to check the copy, media, or demo channel state.</p></div></div></section></div>{openPost && <div className="modal-backdrop" onClick={() => setOpenPost(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>Post details</h2><button className="close" onClick={() => setOpenPost(null)} data-testid="button-close-post-details"><X /></button></div><div className="modal-body"><div style={{ height: 160, borderRadius: 8, background: openPost.media.color, marginBottom: 16 }} /><StatusBadge status={openPost.status} /><p style={{ marginTop: 14, lineHeight: 1.6, fontSize: 13, whiteSpace: 'pre-line' }}>{openPost.caption}</p><div style={{ display: 'flex', gap: 6, marginTop: 13 }}><PlatformDots items={openPost.platforms} /></div><div className="form-actions"><button className="button button-danger" onClick={() => remove(openPost.id)} data-testid="button-delete-post"><Trash2 size={14} /> Delete</button><button className="button button-ghost" onClick={() => setOpenPost(null)} data-testid="button-done-post-details">Done</button></div></div></div></div>}</div>;
}

function MediaLibrary({ media, setMedia, setToast }: { media: MediaItem[]; setMedia: (items: MediaItem[]) => void; setToast: (message: string) => void }) {
  const [query, setQuery] = useState(''); const [folder, setFolder] = useState('All folders'); const [preview, setPreview] = useState<MediaItem | null>(null);
  const folders = ['All folders', ...Array.from(new Set(media.map((item) => item.folder)))];
  const shown = media.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (folder === 'All folders' || item.folder === folder));
  return <div className="content"><PageHeading eyebrow="Your content shelf" title="Media library" description="The photos and videos that make your store feel familiar. Find one, preview it, and keep moving." action={<button className="button button-primary" onClick={() => { const next: MediaItem = { id: Date.now(), name: 'New store upload', type: 'Image', folder: 'Storefront', dimensions: '1600 × 1200', size: '1.1 MB', color: 'linear-gradient(135deg,#2f496b,#eeb05e)' }; setMedia([next, ...media]); setToast('Demo media added to Storefront.'); }} data-testid="button-upload-media"><Upload size={15} /> Add demo media</button>} /><div className="toolbar"><div className="search-wrap"><Search /><input type="search" placeholder="Search media" value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-search-media" /></div><select className="select" value={folder} onChange={(e) => setFolder(e.target.value)} data-testid="select-media-folder">{folders.map((item) => <option value={item} key={item}>{item}</option>)}</select><span className="tag">{shown.length} items</span></div><div className="media-grid">{shown.map((item) => <div className="card media-tile" key={item.id} data-testid={`card-media-${item.id}`}><button className="media-check" onClick={() => { setPreview(item); }} aria-label={`Preview ${item.name}`} data-testid={`button-preview-media-${item.id}`}><ArrowUpRight size={14} /></button><div className="media-image" style={{ background: item.color }} />{item.type === 'Video' && <span className="status status-scheduled" style={{ position: 'absolute', top: 9, left: 9 }}><Video size={11} /> Video</span>}<div className="media-meta"><strong>{item.name}</strong><span>{item.folder} · {item.dimensions}</span><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}><button className="text-link" onClick={() => { const next = prompt('Rename this demo media', item.name); if (next?.trim()) { setMedia(media.map((entry) => entry.id === item.id ? { ...entry, name: next.trim() } : entry)); setToast('Media renamed.'); } }} data-testid={`button-rename-media-${item.id}`}><Pencil size={11} style={{ verticalAlign: 'middle' }} /> Rename</button><button className="text-link" style={{ color: '#c1504b' }} onClick={() => { setMedia(media.filter((entry) => entry.id !== item.id)); setToast('Media removed from the demo library.'); }} data-testid={`button-delete-media-${item.id}`}><Trash2 size={11} style={{ verticalAlign: 'middle' }} /> Delete</button></div></div></div>)}</div>{!shown.length && <div className="card empty"><FileImage /><strong>Nothing matches that search</strong><p>Try a different phrase or browse another folder.</p></div>}{preview && <div className="modal-backdrop" onClick={() => setPreview(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>{preview.name}</h2><button className="close" onClick={() => setPreview(null)} data-testid="button-close-media-preview"><X /></button></div><div className="modal-body"><div style={{ height: 260, borderRadius: 9, background: preview.color }} /><p className="subheading" style={{ marginTop: 14 }}>{preview.type} · {preview.dimensions} · {preview.size}</p><div className="form-actions"><button className="button button-primary" onClick={() => { setToast(`${preview.name} selected for your next post.`); setPreview(null); }} data-testid="button-select-media"><Check size={14} /> Use in a post</button></div></div></div></div>}</div>;
}

const templates = [
  { id: 1, category: 'Offers', title: 'The upgrade that fits', description: 'A clean way to spotlight trade-in value without making a promise you cannot keep.', tags: ['Trade-in', 'Product'], color: '' },
  { id: 2, category: 'Repairs', title: 'Fixed before lunch', description: 'Set the expectation for a quick repair desk visit with a human tone.', tags: ['Repair', 'Service'], color: 'orange' },
  { id: 3, category: 'Community', title: 'We know this block', description: 'A neighborhood-forward post for the small moments that build trust.', tags: ['Local', 'Brand'], color: 'sand' },
  { id: 4, category: 'Products', title: 'Worth a closer look', description: 'Introduce one product detail people can actually use.', tags: ['Product', 'Helpful'], color: '' },
  { id: 5, category: 'Tips', title: 'One minute fix', description: 'Share a practical phone tip that earns a save, not just a scroll-by.', tags: ['Tips', 'Education'], color: 'orange' },
  { id: 6, category: 'Offers', title: 'This week at the counter', description: 'Turn a limited-time promotion into a clear next step.', tags: ['Offer', 'Urgency'], color: 'sand' },
];

function TemplatesPage({ setToast, onUseTemplate }: { setToast: (message: string) => void; onUseTemplate: (template: typeof templates[number]) => void }) {
  const [category, setCategory] = useState('All categories'); const categories = ['All categories', 'Offers', 'Repairs', 'Community', 'Products', 'Tips'];
  const shown = templates.filter((item) => category === 'All categories' || item.category === category);
  return <div className="content"><PageHeading eyebrow="Template library" title="Start with a good idea." description="Built for the moments cellphone stores see every week—then written so your own voice can take over." /><div className="toolbar">{categories.map((item) => <button className={`platform-pill ${category === item ? 'selected' : ''}`} key={item} onClick={() => setCategory(item)} data-testid={`button-template-category-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div><div className="template-grid">{shown.map((item) => <article className="card" key={item.id} data-testid={`card-template-${item.id}`}><div className={`template-art ${item.color}`}><strong>{item.title}</strong><span style={{ position: 'absolute', bottom: 12, left: 17, fontSize: 9, color: '#ffe1aa', letterSpacing: '.11em', textTransform: 'uppercase' }}>{item.category}</span></div><div className="template-meta"><h3>{item.title}</h3><p>{item.description}</p><div className="tags">{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><Link href="/create-post" className="button button-ghost" style={{ marginTop: 14, width: '100%' }} onClick={() => { onUseTemplate(item); setToast(`"${item.title}" is ready in the composer.`); }} data-testid={`link-use-template-${item.id}`}>Use this template <ArrowUpRight size={14} /></Link></div></article>)}</div></div>;
}

function PromotionsPage({ promotions, setPromotions, setToast, onUsePromotion }: { promotions: Promotion[]; setPromotions: (items: Promotion[]) => void; setToast: (message: string) => void; onUsePromotion: (promotion: Promotion) => void }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [price, setPrice] = useState('');
  const create = () => { if (!name.trim()) return; setPromotions([{ id: Date.now(), name, description: description || 'A new store promotion ready for your next post.', startDate: 'Jun 20, 2024', endDate: 'Jun 30, 2024', price: price || '$—', discount: 'demo offer', cta: 'Visit us today' }, ...promotions]); setName(''); setDescription(''); setPrice(''); setOpen(false); setToast('Promotion created in demo mode.'); };
  return <div className="content"><PageHeading eyebrow="Store offers" title="Promotions" description="Keep the offer clear here, then turn it into content when the timing feels right." action={<button className="button button-primary" onClick={() => setOpen(true)} data-testid="button-new-promotion"><Plus size={15} /> New promotion</button>} /><div className="demo-callout"><Info size={16} /><span>Promotions are local demo records. Creating one does not change pricing, inventory, or a live store listing.</span></div><div className="promo-grid">{promotions.map((item) => <article className="card promo-card" key={item.id} data-testid={`card-promotion-${item.id}`}><span className="status status-scheduled">Active in demo</span><h3 style={{ marginTop: 13 }}>{item.name}</h3><p>{item.description}</p><div className="promo-detail"><div>Offer<strong>{item.price}</strong></div><div>Dates<strong>{item.startDate} – {item.endDate}</strong></div></div><div style={{ display: 'flex', gap: 8 }}><Link href="/create-post" className="button button-primary" onClick={() => { onUsePromotion(item); setToast(`"${item.name}" added as a starting point in the composer.`); }} data-testid={`link-promotion-to-post-${item.id}`}><Send size={13} /> Turn into a post</Link><button className="button button-ghost" onClick={() => { setPromotions(promotions.filter((promo) => promo.id !== item.id)); setToast('Promotion removed.'); }} data-testid={`button-delete-promotion-${item.id}`}><Trash2 size={13} /></button></div></article>)}</div>{open && <div className="modal-backdrop" onClick={() => setOpen(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>New promotion</h2><button className="close" onClick={() => setOpen(false)} data-testid="button-close-promotion"><X /></button></div><div className="modal-body"><div className="form-grid"><div className="field full"><label htmlFor="promotion-name">Promotion name</label><input id="promotion-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Back-to-school setup" data-testid="input-promotion-name" /></div><div className="field full"><label htmlFor="promotion-description">Description</label><textarea id="promotion-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should customers know?" data-testid="textarea-promotion-description" /></div><div className="field"><label htmlFor="promotion-price">Offer value</label><input id="promotion-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$49" data-testid="input-promotion-price" /></div><div className="field"><label htmlFor="promotion-end">Ends</label><input id="promotion-end" type="date" defaultValue="2024-06-30" data-testid="input-promotion-end" /></div></div><div className="form-actions"><button className="button button-ghost" onClick={() => setOpen(false)} data-testid="button-cancel-promotion">Cancel</button><button className="button button-primary" onClick={create} data-testid="button-save-promotion"><Check size={14} /> Save promotion</button></div></div></div></div>}</div>;
}

function AnalyticsPage() {
  const [range, setRange] = useState('Last 30 days');
  return <div className="content"><PageHeading eyebrow="Measure the signal" title="Analytics" description="A helpful rehearsal for the numbers you will watch once channels are connected." action={<select className="select" value={range} onChange={(e) => setRange(e.target.value)} data-testid="select-analytics-range"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select>} /><div className="demo-callout"><Info size={16} /><span><strong>DEMO DATA.</strong> These numbers are illustrative and are not pulled from Facebook, Instagram, TikTok, YouTube, or Google Business.</span></div><div className="analytics-grid">{[['Followers', '2,481', '+6.4%'], ['Reach', '18,942', '+12.7%'], ['Impressions', '31,408', '+8.2%'], ['Engagement rate', '6.8%', '+1.1%']].map(([label, value, delta], i) => <div className="card metric-card" key={label} data-testid={`analytics-metric-${i}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{delta} vs previous period</div></div>)}</div><div className="dashboard-grid"><section className="card card-pad"><div className="section-head"><div><h2>Reach over time</h2><p>{range} · illustrative trend</p></div><BarChart3 size={18} color="#c97918" /></div><div className="chart-area">{[32, 43, 38, 54, 48, 63, 58, 72, 66, 81, 76, 92].map((height, i) => <div className="chart-line" style={{ height: `${height}%` }} key={i} />)}</div><div className="bar-labels"><span>Jun 01</span><span>Jun 08</span><span>Jun 15</span><span>Jun 18</span></div></section><section className="card card-pad"><div className="section-head"><div><h2>Best-performing posts</h2><p>By engagement in demo data</p></div><ArrowUpRight size={18} color="#c97918" /></div>{['The upgrade that fits', 'Meet the repair team', 'Weekend accessory wall'].map((item, i) => <div className="activity-row" key={item}><span className="avatar" style={{ background: i === 1 ? '#c8781d' : '#304c70' }}>{String(i + 1).padStart(2, '0')}</span><div className="activity-main"><strong>{item}</strong><span>{[12.4, 9.7, 8.3][i]}% engagement · {['Facebook + Instagram', 'Instagram', 'TikTok'][i]}</span></div><span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, fontWeight: 700 }}>{['4.2k', '2.9k', '2.1k'][i]}</span></div>)}</section></div></div>;
}

function SettingsPage({ setToast }: { setToast: (message: string) => void }) {
  const [tab, setTab] = useState('Store branding'); const [storeName, setStoreName] = useState('Riverbend Wireless'); const [phone, setPhone] = useState('(319) 555-0148'); const [saved, setSaved] = useState(false);
  const tabs = ['Store branding', 'Team & account', 'Notifications', 'Future integrations'];
  return <div className="content"><PageHeading eyebrow="Workspace preferences" title="Settings" description="Shape the details CellPoint Pro uses to keep your store looking and sounding like itself." /><div className="settings-grid"><aside className="card settings-nav">{tabs.map((item) => <button className={`settings-tab ${tab === item ? 'active' : ''}`} key={item} onClick={() => setTab(item)} data-testid={`button-settings-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</aside><section className="card card-pad">{tab === 'Store branding' && <><div className="section-head"><div><h2>Store branding</h2><p>Used in previews and future channel content.</p></div><Store size={19} color="#c97918" /></div><div className="form-grid"><div className="field"><label htmlFor="store-name">Store name</label><input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} data-testid="input-store-name" /></div><div className="field"><label htmlFor="store-phone">Phone</label><input id="store-phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="input-store-phone" /></div><div className="field full"><label htmlFor="store-address">Address</label><input id="store-address" defaultValue="482 Market Street, Cedar Falls, IA 50613" data-testid="input-store-address" /></div><div className="field"><label htmlFor="store-website">Website</label><input id="store-website" defaultValue="riverbendwireless.com" data-testid="input-store-website" /></div><div className="field"><label>Logo</label><div className="settings-logo-preview"><div className="settings-logo-wrap"><img src="/brand/cellpoint-pro-logo.png" alt="CellPoint Pro logo" /></div><span>Brand mark in use</span></div></div></div></>}{tab === 'Team & account' && <SettingsPlaceholder icon={<Users />} title="Team & account" copy="Invite teammates, set roles, and choose who can approve content before publishing." action="Invite a teammate" onClick={() => setToast('Team invitations will be available outside demo mode.')} />}{tab === 'Notifications' && <SettingsPlaceholder icon={<Bell />} title="Notifications" copy="Choose which reminders keep your content queue moving without adding noise." action="Save notification preferences" onClick={() => setToast('Notification preferences saved locally.')} />}{tab === 'Future integrations' && <SettingsPlaceholder icon={<Link2 />} title="Future integrations" copy="Channel connections, review tools, and store systems will live here when this workspace is connected." action="View connection guide" onClick={() => setToast('Integration guide opened in demo mode.')} />} {tab === 'Store branding' && <div className="form-actions"><span style={{ color: saved ? '#38836a' : 'hsl(var(--muted-foreground))', fontSize: 11, marginRight: 'auto' }}>{saved ? 'Saved just now' : 'Changes are local to this demo.'}</span><button className="button button-primary" onClick={() => { setSaved(true); setToast('Store branding saved locally.'); }} data-testid="button-save-branding"><Check size={14} /> Save changes</button></div>}</section></div></div>;
}

function SettingsPlaceholder({ icon, title, copy, action, onClick }: { icon: ReactNode; title: string; copy: string; action: string; onClick: () => void }) {
  return <><div className="section-head"><div><h2>{title}</h2><p>{copy}</p></div><span style={{ color: '#c97918' }}>{icon}</span></div><div className="empty" style={{ padding: '42px 20px' }}><Settings2 /><strong>Ready when you are</strong><p>This preference is represented here so the workspace is easy to grow beyond Demo Mode.</p><button className="button button-ghost" style={{ marginTop: 15 }} onClick={onClick} data-testid={`button-${action.toLowerCase().replaceAll(' ', '-')}`}>{action}</button></div></>;
}

function LaunchErrorPage({ code }: { code: 'missing-store-id' | 'invalid-store-id' }) {
  const copy = getPosLaunchErrorCopy(code);
  return <div className="launch-page"><header className="launch-header"><div className="brand-logo-wrap"><img src="/brand/cellpoint-pro-logo.png" alt="CellPoint Pro" /></div><span className="launch-header-label">POS browser launch</span></header><main className="launch-error-wrap"><section className="card launch-error-card"><div className="launch-error-icon"><CircleHelp size={25} /></div><div className="eyebrow">Launch link needs attention</div><h1>{copy.title}</h1><p>{copy.description}</p><div className="launch-error-note"><Info size={15} /><span>For security, a store ID in a URL is only a temporary development routing value. It does not sign you in.</span></div><Link href="/" className="button button-primary" data-testid="link-return-standalone">Return to standalone workspace <ArrowUpRight size={14} /></Link></section></main></div>;
}

function LaunchShell({ children }: { children: ReactNode }) {
  return <div className="launch-page"><header className="launch-header"><div className="brand-logo-wrap"><img src="/brand/cellpoint-pro-logo.png" alt="CellPoint Pro" /></div><div className="launch-header-meta"><span className="launch-header-label">POS browser launch</span><span className="launch-secure-note"><span className="demo-dot" /> Development context</span></div></header>{children}</div>;
}

function LaunchPage({ posts, context }: { posts: Post[]; context: PosLaunchStoreContext }) {
  return <LaunchShell><main><Dashboard posts={posts} launchContext={context} /></main></LaunchShell>;
}

function NotFound() {
  return <div className="content"><div className="card empty"><CircleHelp /><strong>That page is not in this demo</strong><p>Use the workspace navigation to find your way back.</p><Link href="/" className="button button-primary" style={{ marginTop: 16 }}>Back to overview</Link></div></div>;
}

function Router({ posts, setPosts, media, setMedia, promotions, setPromotions, setToast, onUseTemplate, onUsePromotion, composerStarter }: { posts: Post[]; setPosts: (items: Post[]) => void; media: MediaItem[]; setMedia: (items: MediaItem[]) => void; promotions: Promotion[]; setPromotions: (items: Promotion[]) => void; setToast: (message: string) => void; onUseTemplate: (template: typeof templates[number]) => void; onUsePromotion: (promotion: Promotion) => void; composerStarter: { caption: string; media: MediaItem } | null }) {
  return <Switch>
     <Route path="/"><Dashboard posts={posts} /></Route>
    <Route path="/social-accounts"><SocialAccounts setToast={setToast} /></Route>
    <Route path="/create-post"><Composer media={media} initialCaption={composerStarter?.caption} initialMedia={composerStarter?.media} onSave={(post) => setPosts([post, ...posts])} setToast={setToast} /></Route>
    <Route path="/calendar"><CalendarPage posts={posts} setPosts={setPosts} setToast={setToast} media={media} /></Route>
    <Route path="/media-library"><MediaLibrary media={media} setMedia={setMedia} setToast={setToast} /></Route>
    <Route path="/templates"><TemplatesPage setToast={setToast} onUseTemplate={onUseTemplate} /></Route>
    <Route path="/promotions"><PromotionsPage promotions={promotions} setPromotions={setPromotions} setToast={setToast} onUsePromotion={onUsePromotion} /></Route>
    <Route path="/analytics"><AnalyticsPage /></Route>
    <Route path="/settings"><SettingsPage setToast={setToast} /></Route>
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts); const [media, setMedia] = useState<MediaItem[]>(initialMedia); const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions); const [mobileOpen, setMobileOpen] = useState(false); const [toast, setToast] = useState(''); const [composerStarter, setComposerStarter] = useState<{ caption: string; media: MediaItem } | null>(null);
  const stableToast = useMemo(() => toast, [toast]);
  const startFromTemplate = (template: typeof templates[number]) => setComposerStarter({ caption: `${template.title}\n\n${template.description}`, media: media[0] });
  const startFromPromotion = (promotion: Promotion) => setComposerStarter({ caption: `${promotion.name}\n\n${promotion.description}\n\n${promotion.cta}`, media: media[1] });
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppContent posts={posts} setPosts={setPosts} media={media} setMedia={setMedia} promotions={promotions} setPromotions={setPromotions} setToast={setToast} onUseTemplate={startFromTemplate} onUsePromotion={startFromPromotion} composerStarter={composerStarter} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /></WouterRouter><Toaster />{stableToast && <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 200, background: '#203a5e', color: '#fff', borderRadius: 9, padding: '12px 15px', boxShadow: '0 10px 25px rgba(25,40,60,.2)', fontSize: 12, maxWidth: 340, animation: 'rise-in .2s ease' }} role="status" data-testid="status-toast"><Check size={14} style={{ verticalAlign: 'middle', marginRight: 7, color: '#b9c5d2' }} />{stableToast}<button onClick={() => setToast('')} style={{ marginLeft: 12, border: 0, background: 'transparent', color: '#b9c5d2' }} aria-label="Dismiss notification" data-testid="button-dismiss-toast"><X size={13} /></button></div>}</TooltipProvider></QueryClientProvider>;
}

type AppContentProps = {
  posts: Post[];
  setPosts: (items: Post[]) => void;
  media: MediaItem[];
  setMedia: (items: MediaItem[]) => void;
  promotions: Promotion[];
  setPromotions: (items: Promotion[]) => void;
  setToast: (message: string) => void;
  onUseTemplate: (template: typeof templates[number]) => void;
  onUsePromotion: (promotion: Promotion) => void;
  composerStarter: { caption: string; media: MediaItem } | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

function AppContent({ posts, setPosts, media, setMedia, promotions, setPromotions, setToast, onUseTemplate, onUsePromotion, composerStarter, mobileOpen, setMobileOpen }: AppContentProps) {
  const [location] = useLocation();
  if (location === '/launch') {
    const launch = resolvePosLaunch(window.location.search);
    if (launch.kind === 'error') {
      return <LaunchErrorPage code={launch.code} />;
    }
    return <LaunchPage posts={posts} context={launch.context} />;
  }

  return <Shell mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}><Router posts={posts} setPosts={setPosts} media={media} setMedia={setMedia} promotions={promotions} setPromotions={setPromotions} setToast={setToast} onUseTemplate={onUseTemplate} onUsePromotion={onUsePromotion} composerStarter={composerStarter} /></Shell>;
}

export default App;