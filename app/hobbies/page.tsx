'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface Hobby {
  id: string;
  title: string;
  en: string;
  desc: string;
  detail: string[];
}

const hobbies: Hobby[] = [
  {
    id: 'coding',
    title: '编程',
    en: 'Coding',
    desc: '探索新的语言、框架与开发工具，乐于解决复杂问题。',
    detail: [
      '写代码于我而言，更像是在搭建一种"看不见的建筑"——每一个函数、每一段抽象，都是结构里的支柱与梁。',
      '我喜欢在深夜调试一段崩溃的逻辑，最终看着控制台跳出绿色 PASS 的那一刻——那种从混沌中梳理出秩序的满足感，是其他事很难替代的。',
    ],
  },
  {
    id: 'reading',
    title: '阅读',
    en: 'Reading',
    desc: '科技、人文、设计——在不同领域间汲取灵感。',
    detail: [
      '从《人月神话》到《艺术的故事》，从硬科幻到散文随笔。我相信跨领域的阅读才能让人保持立体的视角。',
      '一本好书就像一位坐在你对面的智者：不催促、不评判，只把它的世界缓缓铺给你看。',
    ],
  },
  {
    id: 'visuals',
    title: '影像',
    en: 'Visuals',
    desc: '关注视觉表达与动画，热爱有质感的设计语言。',
    detail: [
      '从 MAPPA 的开场分镜到 Pixar 的运动设计，从 Bruno Simon 的 WebGL 实验到苹果发布会的微动效——视觉语言的克制与张力，常常给我代码以灵感。',
      '我相信"质感"是一种值得追求的东西，无论是在像素里、在镜头里、还是在生活里。',
    ],
  },
];

export default function HobbiesPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
          {/* 页头 */}
          <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3 reveal">
            Hobbies
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 reveal reveal-delay-1">
            爱好
          </h1>

          {/* 引语 */}
          <section className="max-w-3xl">
            <div className="text-xs tracking-[0.4em] uppercase text-white/40 mb-4 reveal">
              Intro
            </div>
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white tracking-tight reveal reveal-delay-1">
              工作之外的那些时刻，常常更像我自己。
            </p>
            <div className="mt-8 space-y-5 text-white/75 text-base md:text-lg leading-[1.9] reveal reveal-delay-2">
              <p>
                有人靠工作定义自己，我更愿意被那些没人交代我去做、却忍不住做的事所定义——它们更接近我真实的样子。
              </p>
              <p>
                这些爱好彼此独立，却又互相牵引：阅读让代码更克制，影像让设计更有节奏，编程则让一切灵感都有了落地的可能。
              </p>
            </div>
          </section>

          {/* 爱好详情 */}
          <div className="mt-24 space-y-24">
            {hobbies.map((hobby, idx) => (
              <section key={hobby.id} id={hobby.id} className="scroll-mt-28">
                {/* 章节编号 + 英文标 */}
                <div className="flex items-baseline gap-4 mb-4 reveal">
                  <span className="text-sm tracking-[0.35em] uppercase text-white/40 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs tracking-[0.35em] uppercase text-white/40">
                    {hobby.en}
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 reveal reveal-delay-1">
                  {hobby.title}
                </h3>
                <div className="text-sm tracking-widest uppercase text-white/50 mb-8 reveal reveal-delay-1">
                  {hobby.desc}
                </div>

                {/* 详情段落 */}
                <div className="space-y-5 text-white/75 text-base md:text-lg leading-[1.9] max-w-3xl reveal reveal-delay-2">
                  {hobby.detail.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
