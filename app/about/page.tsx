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
      '这是我高考结束的第二天。高考结束，没有庆祝没有欢聚，只有干活的催促、被不理解、被压力，于是我离家出走，去到我好朋友那里住，过上了超市收银的生活——在同学家很大的一个超市里收银。我的第一份工作，也在和同学父亲签下合同的那一刻开始。',
      '每天工作八个小时，只能站着不能坐着，家里人打来电话我不接，就这样持续了三天。三天后，被家里人以我最心疼的奶奶要挟回家，带着微信转过来的 150 块钱回家了。这是我永远忘不掉的一段经历。',
    ],
    images: [],
  },
  {
    id: 'sunshine',
    company: '神思电子',
    role: '大数据研发实习生',
    period: '第一段技术工作',
    narrative: [
      '大二下学期，因为半年每天十小时、学到手抖心悸、学到喘不上气，学完了大数据技术栈的全部内容，找到了第一份大数据专业的实习。在济南，坐火车过去的，但因为火车上两个人面对面坐着太尴尬，后来改坐高铁了。',
      '济南给我的印象不好，因为夏天实在太热了。我承认这是一个有人情味的城市，但距离公司十分钟的自行车车程，能把我蒸化了的感觉。这座城市好多泉水，挖不了地铁，一路上全是电动车，加上糟糕的道路建设，每天上下班都是煎熬。',
      '不过这两个月，真正感受到了当大人的感觉——自己租房、自己准备所有东西、自己面对工作上的事情、处理各种关系，是一段自由又不知所措的经历。我学到了好多，不论是初次正式工作上的规范，还是真正企业中的实践，都是现在能在中国最大的互联网公司实习不可或缺的一部分。',
      '水往低处流，人向高处走。我的宿命终不在这里，谢谢这两个半月的一切，谢谢勇敢独立的自己。',
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
      '我终于做到了。自 25 年 2 月 8 号萌生大厂实习的念头，到 26 年 3 月 16 号，整整一年，除两个半月实习外的每天均九小时的痛苦求学，我终于拿下了。我证明了自己——不需要生活费，可以只靠自己，可以做到我想做到的。',
      '到今天 6.6，我依旧在工位上努力着。近三个月的时间，Spark 调优应用到了实践，SQL 写了不尽其数，遇到的大佬数不尽数，同事都是十分厉害的技术人，令人瞻仰。但日复一日的十点下班，两段实习的感受，到读完一些书、了解一些故事后，我发现我的宿命也不在这里。',
      '这也是我拒绝转正的原因。我和同样在实习的两个研究生实习生说，21 岁不是给 yiming 打工的年纪，而是想成为 yiming 的年纪，他们笑我说本科出来的就是狂傲。我不知道这算不算狂傲，我只知道我不甘心上一辈子班，不甘心一辈子困在一个小小的工位上。或许月入过万的实习在别人眼里看来很优秀，但别人本就不是我的竞争对手。',
      '我要给社会创造价值，别人提供不了的价值。我要财富自由，我要做自己感兴趣的事，我要给我珍视的人幸福，我要给我的人生活出属于我的意义。我的重点不在这里，我可以承受无数次失败，而只需要一次成功。我的竞争对手只有我自己。',
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
      '挑了点自己喜欢的图片。故事还在书写，我们都在前行，无视他人接着打怪升级吧，这个狂傲的小大人。',
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
