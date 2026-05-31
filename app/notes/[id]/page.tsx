import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NoteContent from '@/components/NoteContent';
import { notes, getNoteById } from '@/lib/notes';

/** Next.js 16：动态路由的 params 是 Promise，必须 await */
type RouteParams = Promise<{ id: string }>;

/** 静态生成所有笔记的详情页（musing + essay 都可独立访问） */
export function generateStaticParams() {
  return notes.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) return { title: '笔记 — Liu' };
  return {
    title: `${note.title ?? note.category} — Liu`,
    description: note.body[0]?.slice(0, 80) ?? '',
  };
}

export default async function NoteDetailPage({ params }: { params: RouteParams }) {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <NoteContent note={note} />
      </main>

      <Footer />
    </div>
  );
}
