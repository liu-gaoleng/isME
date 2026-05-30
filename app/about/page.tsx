'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageCarousel from '@/components/ImageCarousel';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  narrative: string[];
  images: { src: string; alt?: string; caption?: string }[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'supermarket',
    company: '超市收银',
    role: '收银员 / 兼职',
    period: '学生时代的第一份工作',
    narrative: [
      '高峰时段的扫码声、找零的清脆碰撞、顾客一句简单的"谢谢"——这是我人生中第一次明白：所谓"工作"，是把自己交给一段段陌生的对话与责任。',
      '我学会了在嘈杂里保持专注、在抱怨中保持微笑，也学会了体恤每一个站在收银台前的人——每个人背后都有一段我看不见的生活。',
    ],
    images: [],
  },
  {
    id: 'sunshine',
    company: '神思电子',
    role: '软件研发实习生',
    period: '第一段技术工作',
    narrative: [
      '在神思电子的那段日子，是我第一次真正意义上"写代码挣工资"。我学会了 Git、学会了写文档、学会了在评审中被否定后还能笑着回去改稿。',
      '前辈们把工程素养揉碎了塞给我：命名要让别人秒懂、提交要小步快跑、Bug 不可怕、可怕的是不愿正视它。这段经历构筑了我对"专业"二字最初的理解。',
    ],
    images: [
      { src: '/material/experiences/sunshine/08006a21f4e9d5da44fcc2cfd441b0b3.jpg' },
      { src: '/material/experiences/sunshine/1dcafc2c0e8a9ebc51b80e9d775cae39.jpg' },
      { src: '/material/experiences/sunshine/31582152ed2b718dc78d27e5647bd529.jpg' },
      { src: '/material/experiences/sunshine/35b57305eedd6d4f2273ce25c5e658c7.jpg' },
      { src: '/material/experiences/sunshine/9b7d5226ba31918531ed8e948f4e982f.jpg' },
      { src: '/material/experiences/sunshine/b11b21e718fb67a3c6b712c0ccc14b37.jpg' },
      { src: '/material/experiences/sunshine/c562b5fdb8ccb61d29115709327b783a.jpg' },
      { src: '/material/experiences/sunshine/cb6737844cb303b8e70d79e552a44a3b.jpg' },
      { src: '/material/experiences/sunshine/d1b16197ed3bd9a34af69b7e9d390cac.jpg' },
      { src: '/material/experiences/sunshine/e054316d94bfa5a659de1e2c1419172d.jpg' },
      { src: '/material/experiences/sunshine/f1c70e2dca01f215ede078b295c3f46f.jpg' },
    ],
  },
  {
    id: 'bytedance',
    company: '字节跳动',
    role: '研发工程师',
    period: '正在书写的当下',
    narrative: [
      '在字节跳动，我看到了真正的"规模"——亿级用户、毫秒级响应、跨时区协同。这里教会我的最重要一课是：在巨大的复杂性面前，依然要保持代码的洁癖与对体验的执拗。',
      '我把"用户视角"刻在了脑子里：每一行代码都可能影响一个真实的人，无论那个人远在哪里。',
    ],
    images: [
      { src: '/material/experiences/bytedance/07e76f9e723d68c8f0fc50b6d5cd4345.jpg' },
      { src: '/material/experiences/bytedance/130a2857b5c6725b86128c91d934b043.jpg' },
      { src: '/material/experiences/bytedance/1f03c553e2cca51fad7d44e18ef6338d.jpg' },
      { src: '/material/experiences/bytedance/277cc12ea1a788d0c98a35592bfa8a12.jpg' },
      { src: '/material/experiences/bytedance/33f30c3831f05b018c32d6353350ee71.jpg' },
      { src: '/material/experiences/bytedance/36cd6866b5640001fe413bdddd04f2ba.jpg' },
      { src: '/material/experiences/bytedance/5f028c388717549257e3bbff98c1e48e.jpg' },
      { src: '/material/experiences/bytedance/5fa78dcd6dc70c5c3dbe85d4fd6cf461.jpg' },
      { src: '/material/experiences/bytedance/6c1beb0c60064d13a32e2a55da2d5090.jpg' },
      { src: '/material/experiences/bytedance/7535b5432d348839fee43b5c9515d2b1.jpg' },
      { src: '/material/experiences/bytedance/7d09814e5db075dce2a3db8ce811d485.jpg' },
      { src: '/material/experiences/bytedance/7d0eaf1472f14b8db1bf8331b2a7c93c.jpg' },
      { src: '/material/experiences/bytedance/9626e9e58b3a85ac7756e7d025ea6532.jpg' },
      { src: '/material/experiences/bytedance/a109055113f0478b000b6efa2557a2d2.jpg' },
      { src: '/material/experiences/bytedance/a3df646ffb98ff493a9284fab3e5f27f.jpg' },
      { src: '/material/experiences/bytedance/ab7a1d22b0e975ae706021348ae4fabd.jpg' },
      { src: '/material/experiences/bytedance/d4c0005db672c9f64ab4bd56b7e5e391.jpg' },
      { src: '/material/experiences/bytedance/d4cb33b2992907f7f4a92b4be8fd96f4.jpg' },
      { src: '/material/experiences/bytedance/d84c7348d75cbae64c6f2fa44a3a177b.jpg' },
      { src: '/material/experiences/bytedance/dcc3193d02025df3d7dbf0121e528432.jpg' },
    ],
  },
  {
    id: 'next',
    company: '$...',
    role: '尚未抵达的远方',
    period: 'To Be Continued',
    narrative: [
      '下一站是哪里，我还不知道。也许是创业，也许是研究，也许是一段更野的旅程——但我知道，我会继续做一件事：对得起自己的好奇心，对得起每一个相信我的人。',
      '这里留白，是因为故事还在写。',
    ],
    images: [
      { src: '/material/experiences/next/0907aecb8def50ae11b7b012f4e781c7.jpg' },
      { src: '/material/experiences/next/54a5f0b38d68346c8b6702b1735906ab.jpg' },
      { src: '/material/experiences/next/6cf141db0310100236c2225cd24d59c6.jpg' },
      { src: '/material/experiences/next/83451e6ddaab83e30e0e66d3d0edbd3f.jpg' },
      { src: '/material/experiences/next/8ceb904f5bface7c60c8cea2ae57554c.jpg' },
      { src: '/material/experiences/next/90d337fedca9ea34b9bb67e4441d7b16.jpg' },
      { src: '/material/experiences/next/9ad6b7d29235b68ddd553e909a2fc39d.jpg' },
      { src: '/material/experiences/next/9bb7bc508d203991183fe4663b7dc600.jpg' },
      { src: '/material/experiences/next/a2d48fce39188acf33b17210b4b7633c.jpg' },
      { src: '/material/experiences/next/a442a252ceb4ccbf128e38d0ad4eaf75.jpg' },
      { src: '/material/experiences/next/a63d54c2d46bb7b8a5d239b652b754c9.jpg' },
      { src: '/material/experiences/next/ae3bd25ae1fb40e1645fb4db40853ae0.jpg' },
      { src: '/material/experiences/next/c2acb627f1058a2482ae29445583c759.jpg' },
      { src: '/material/experiences/next/d99418654cfe16f6270a17ea4dcfe857.jpg' },
      { src: '/material/experiences/next/df073125902e403a109cea66cc09dc0c.jpg' },
      { src: '/material/experiences/next/e490d09e46da8723a8dfe33dc3cc84f6.jpg' },
      { src: '/material/experiences/next/f6e8f57afe9b4890ccf9b2d9aec7c5b7.jpg' },
      { src: '/material/experiences/next/f87ff4584ac9a6e2ea0be3a6d848c6fc.jpg' },
      { src: '/material/experiences/next/fcc5f244d64caac56af3dbcc6368c827.jpg' },
    ],
  },
];

export default function AboutPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
          {/* 页头 */}
          <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3 reveal">
            About
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 reveal reveal-delay-1">
            经历
          </h1>

          {/* 个人简介叙事 */}
          <section className="max-w-3xl">
            <div className="text-xs tracking-[0.4em] uppercase text-white/40 mb-4 reveal">
              Intro
            </div>
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white tracking-tight reveal reveal-delay-1">
              我叫 Liu，一个相信&ldquo;代码与文字皆可造物&rdquo;的人。
            </p>
            <div className="mt-8 space-y-5 text-white/75 text-base md:text-lg leading-[1.9] reveal reveal-delay-2">
              <p>
                我习惯用工程师的逻辑去解构世界，又用写作者的笔触去记录生活。
                白天我在敲下一行行严谨的代码，晚上则在文档与笔记里复盘当日的思绪。
                这两件事在我身上并不冲突——它们都是我理解世界的方式。
              </p>
              <p>
                我喜欢从一段平凡的经历里找出值得回味的瞬间。
                超市收银台的一句&ldquo;谢谢&rdquo;、加班深夜屏幕里的微光、上线前那一秒屏息的心跳——
                这些细碎的画面拼起来，构成了我眼中真实的&ldquo;人生&rdquo;。
              </p>
              <p>
                如果你也愿意慢下来读一读这些经历，欢迎沿着下方的时间线继续往下走。
              </p>
            </div>
          </section>

          {/* 经历时间线 */}
          <div className="mt-24 space-y-24">
            {experiences.map((exp, idx) => (
              <section key={exp.id} id={exp.id} className="scroll-mt-28">
                {/* 章节编号 + 标题 */}
                <div className="flex items-baseline gap-4 mb-4 reveal">
                  <span className="text-sm tracking-[0.35em] uppercase text-white/40 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs tracking-[0.35em] uppercase text-white/40">
                    Experience
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 reveal reveal-delay-1">
                  {exp.company}
                </h3>
                <div className="text-sm tracking-widest uppercase text-white/50 mb-8 reveal reveal-delay-1">
                  {exp.role} · {exp.period}
                </div>

                {/* 文字叙事 */}
                <div className="space-y-5 text-white/75 text-base md:text-lg leading-[1.9] max-w-3xl reveal reveal-delay-2">
                  {exp.narrative.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* 图片合集（位于文字下方，无图片时不渲染） */}
                {exp.images.length > 0 && (
                  <div className="mt-10 reveal reveal-delay-3">
                    <ImageCarousel images={exp.images} />
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* 联系方式 */}
          <div className="mt-28 reveal">
            <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3">
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">联系方式</h2>
            <div className="border border-white/10 bg-white/[0.02] p-8">
              <p className="text-white/70">
                如果你有任何问题或合作意向，欢迎通过以下方式联系我：
              </p>
              <div className="mt-4 space-y-2 text-white/70">
                <p>
                  📧 邮箱：
                  <a
                    href="mailto:lee71639301727933@gmail.com"
                    className="underline decoration-white/30 hover:decoration-white hover:text-white transition-colors"
                  >
                    lee71639301727933@gmail.com
                  </a>
                </p>
                <p>
                  📝 GitHub：
                  <a
                    href="https://github.com/liu-gaoleng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-white/30 hover:decoration-white hover:text-white transition-colors"
                  >
                    github.com/liu-gaoleng
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
