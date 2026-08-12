'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface ProductImage {
  src: string;      // 图片路径，放在 public/product/ 下，如 /product/app-home.png
  alt: string;      // 图片说明（无障碍 + 加载失败时的替代文本）
  caption?: string; // 图片下方的小字注释，可不填
}

interface Product {
  id: string;
  title: string;
  en: string;
  status: string;
  period: string;
  summary: string;
  narrative: string[];
  highlights: string[];
  tech: string[];
  repo?: string;
  images?: ProductImage[];
}

const products: Product[] = [
  {
    id: 'redu',
    title: '热读',
    en: 'Hot Read',
    status: '开发中',
    period: '2026',
    summary: '为投资人、产品经理、创业者、互联网从业者打造的一款 App——每天十分钟，了解世界上的宏观、金融、科技、AI 热点。',
    narrative: [
      '在这个信息量爆炸的时代，信息流占用了人们太多宝贵的精力，有价值的信息显得越发重要——通过较少的时间获取到真正有用的信息，是必要的。',
      '核心功能主要包括每日热点及四个模块热点（科技 / 金融 / AI / 宏观），同时包含收藏、观看历史、查看热点来龙去脉等功能。',
      '一开始本想做成所有人都可使用的一款 App，因此打算设计热点评论以及社区互动模块；但了解到我国对于热点汇集类 App 有限制，个人实体很难上线应用，因此便取消了。后续考虑上架国外的 App Store，目前仅个人使用。',
    ],
    highlights: [
      '热点呈现',
      '来龙去脉总结',
      '主题聚焦',
    ],
    tech: ['Swift', 'SwiftUI', 'Python', 'DeepSeek API'],
    images: [
      { src: '/product/app-today.jpg', alt: '热读今日热榜页面', caption: '今日热榜' },
      { src: '/product/app-channel.jpg', alt: '热读频道页面', caption: '频道热榜' },
      { src: '/product/app-detail.jpg', alt: '热读热点详情页面', caption: '热点详情' },
      { src: '/product/app-insight.jpg', alt: '热读 AI 热点透视页面', caption: 'AI 热点透视' },
      { src: '/product/app-profile.jpg', alt: '热读我的页面', caption: '我的' },
      { src: '/product/app-login.jpg', alt: '热读登录页面', caption: '登录页' },
    ],
  },
  {
    id: 'realtime-dwh',
    title: '电商实时数据仓库',
    en: 'Real-time Data Warehouse',
    status: '持续开发中',
    period: '基于 gmall2024 电商场景',
    summary: '一套基于 Apache Flink 的电商实时数仓，通过 Flink CDC 实时采集业务库变更，按 DIM/DWD/DWS 分层加工，并对外提供实时大屏指标服务。',
    narrative: [
      '这是我独立搭建的一套电商实时数据仓库，以 gmall2024 电商业务为场景，目标是把传统 T+1 的离线数仓搬到实时链路上——让交易、流量、用户等核心指标做到近实时更新。',
      '整个项目以 Maven 多模块组织，用 Flink 1.17 做流式计算：通过 Flink CDC 实时捕获 MySQL 业务库 binlog，经 Kafka 作为数据总线串联各层；维度层（DIM）落地到 HBase 并用 Redis 做维表旁路缓存，汇总层（DWS）结果写入 Doris 供 OLAP 查询。',
      '最上层还有一个基于 Spring Boot 的数据服务模块（publisher），把 GMV、各省交易额等指标以接口形式暴露出来，支撑实时可视化大屏。',
    ],
    highlights: [
      'Flink CDC 实时采集 MySQL binlog，替代传统离线 T+1 处理',
      '按 DIM / DWD / DWS 分层建模：DWD 覆盖下单、支付、退款、加购、互动评论等明细，DWS 沉淀 SKU 下单、省份交易额、流量 PV、用户登录等多个聚合窗口',
      'DIM 维度层存 HBase + Redis 旁路缓存，DWS 汇总结果写入 Doris',
      'Spring Boot 数据服务层对外提供 GMV、各省交易额等实时大屏接口',
    ],
    tech: [
      'Apache Flink 1.17',
      'Flink CDC',
      'Kafka',
      'HBase',
      'Doris',
      'Redis',
      'Spring Boot',
      'Java',
    ],
    repo: 'https://github.com/liu-gaoleng/flinkDemo-realTime',
  },
];

export default function ProductsPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
          {/* 页头 */}
          <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3 reveal">
            Products
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 reveal reveal-delay-1">
            产品
          </h1>

          {/* 引语 */}
          <section className="max-w-3xl">
            <div className="text-xs tracking-[0.4em] uppercase text-white/40 mb-4 reveal">
              Intro
            </div>
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white tracking-tight reveal reveal-delay-1">
              这里记录我亲手做出来的东西。
            </p>
            <div className="mt-8 space-y-5 text-white/75 text-base md:text-lg leading-[1.9] reveal reveal-delay-2">
              <p>
                我要着手做自己的产品，或许是下一个 web，下一个 app 亦或是下一个游戏，但定会拿出有限的时间与精力来投入其中。
                我的愿景就是通过自己的产品或服务来给社会提供独一无二、不可或缺的价值，而不是老老实实上班。
                目前正在有想法的是当前的个人博客网站与一个 ...app，app 的功能就先不透露了，尽情期待吧。just do it.
              </p>
            </div>
          </section>

          {/* 产品模块 */}
          <div className="mt-20 space-y-12">
            {products.map((product, idx) => (
              <section
                key={product.id}
                id={product.id}
                className="group/card scroll-mt-28 relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-2xl shadow-black/40 transition-colors duration-500 hover:border-white/25 reveal"
              >
                {/* 顶部渐变色带 */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400/80 via-sky-400/70 to-indigo-400/70" />

                <div className="p-8 sm:p-12 lg:p-16">
                  {/* 章节编号 + 标识 */}
                  <div className="flex items-baseline gap-4 mb-5">
                    <span className="text-sm tracking-[0.35em] uppercase text-white/40 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs tracking-[0.35em] uppercase text-white/40">
                      {product.en}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                    {product.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tracking-widest uppercase text-white/50 mb-8">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      {product.status}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{product.period}</span>
                  </div>

                  {/* 一句话简介 */}
                  <p className="text-xl md:text-2xl font-semibold text-white/90 leading-snug max-w-3xl mb-8">
                    {product.summary}
                  </p>

                  {/* 叙事段落 */}
                  <div className="space-y-5 text-white/75 text-base md:text-lg leading-[1.9] max-w-3xl">
                    {product.narrative.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* 截图画廊：images 非空时展示，竖屏截图按 2/3/4 列自适应排列 */}
                  {product.images && product.images.length > 0 && (
                    <div className="mt-10 max-w-4xl">
                      <div className="text-xs tracking-[0.35em] uppercase text-white/40 mb-4">
                        Screenshots
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {product.images.map((img) => (
                          <figure key={img.src} className="group/img">
                            <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] transition-colors duration-300 group-hover/img:border-white/30">
                              <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
                              />
                            </div>
                            {img.caption && (
                              <figcaption className="mt-2 text-center text-xs tracking-wider text-white/45">
                                {img.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 亮点 */}
                  <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 max-w-3xl">
                    <div className="text-xs tracking-[0.35em] uppercase text-white/40 mb-4">
                      Highlights
                    </div>
                    <ul className="space-y-3">
                      {product.highlights.map((point, i) => (
                        <li key={i} className="flex gap-3 text-white/75 text-base md:text-lg leading-[1.8]">
                          <span className="text-emerald-400/70 shrink-0 mt-1">—</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 技术栈 */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {product.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 text-xs tracking-wider uppercase text-white/70 rounded-full border border-white/15 bg-white/[0.04]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 仓库链接 */}
                  {product.repo && (
                    <div className="mt-10">
                      <a
                        href={product.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 text-sm tracking-widest uppercase text-white/80 hover:bg-white hover:text-black transition-all duration-300"
                      >
                        <span>查看源码</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </a>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* 更多产品占位 */}
          <div className="mt-28 border-t border-white/10 pt-12 reveal">
            <p className="text-white/45 text-base md:text-lg leading-[1.9] max-w-3xl">
              更多产品正在开发中——包括我正在构思的 App 与其他个人项目。
              敬请期待，这里会随着我做出的每一件新东西不断生长。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
