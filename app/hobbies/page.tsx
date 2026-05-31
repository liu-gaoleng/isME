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
    id: 'reading',
    title: '读书',
    en: 'Reading',
    desc: '在不同领域之间汲取灵感，构建立体的认知。',
    detail: [
      '读过不少书，例如《活着》《文城》《病隙碎笔》等国内文学；不过还是国外文学居多——读国内的书过一段时间就容易忘，也很难再带给我一些新的思考，或许是太熟悉汉语的缘故。翻译过来的外国书读起来虽然别扭一些，但反而更容易在不同的句法里撞见新的视角。',
      '《悉达多》《在轮下》——黑塞的书真的可以让人重新找到自己，寻找自己生命的意义。最近读过的《纳瓦尔宝典》《大话西方艺术史》也都很有意思。',
      '正在读《无穷的开始：世界进步的起源》，是我读过最难啃的一本书，里面涉及的知识太多了，慢慢读吧。《枪炮、病菌与钢铁》《不安之书》也不错。《都柏林人》是我一直想读但还没腾出时间的书。',
    ],
  },
  {
    id: 'nba',
    title: 'NBA',
    en: 'Basketball',
    desc: '热爱篮球这项运动，欣赏顶级的竞技与故事。',
    detail: [
      '这还要从我的高中说起。高一时遇见了一个像「仙女」一样的女孩，看到的第一眼就喜欢上了。后来听说她喜欢经常去操场打篮球的男生，便开始日复一日地练习，发誓要做一个超级厉害的篮球小子。',
      '上了两个月课就要分文理科分班，我问她要去哪个班后，得知那个班需要托关系或者花钱才能进，于是让我爸托关系把我弄了进去；但她最终没能进到这个班，还因为这个哭了。分班之后我们纠缠了一段时间，也就没了后续。',
      '那两个月一直在打磨篮球，最后真正爱上了它。开始看 NBA 之后，迷上了 Paul George，一直在看他的比赛——大概率是终生无冠了，但只希望他能健健康康打到退役。作为球迷，珍惜他的每一场，支持他、祝福他，就够了。',
    ],
  },
  {
    id: 'lol',
    title: 'LOL',
    en: 'League of Legends',
    desc: '从童年开始的电子竞技情结。',
    detail: [
      '我童年有好几个哥哥：大哥打 LOL，二哥被大哥带着打，三哥（其实不是三哥，但比我大，也就算三哥了）被二哥带着打，而我呢，被他们仨带着打。',
      '那时候什么都不懂，操作也特别烂，更多的时间是跑到他们几个家里去看他们玩。记得最清楚的，是三哥白银二晋级赛，玩中单男刀，对线被单杀了，坐在屏幕前捶桌子、眼里含着泪水，哈哈哈哈哈哈。',
      '后面长大一点就开始自己玩，但是家里不让玩，只让我玩手机，于是接触了王者荣耀、全民突击、时空召唤等等。但 LOL 始终是我现在也会上号开两把海克斯大乱斗的游戏——算是我的白月光了。',
    ],
  },
  {
    id: 'ai',
    title: 'AI',
    en: 'Artificial Intelligence',
    desc: '关注 AI 的边界与可能，紧追最前沿的技术与产品。',
    detail: [
      '我把 AI 视作我们这一代人最大的杠杆——它正在重写软件、重写工作、重写每个人与世界对话的方式。',
      '自从 OpenAI 的 ChatGPT 问世，世界的形态变了，互联网的形态也变了。继互联网时代之后，我们迎来了 AI 时代——日活三亿、被称为「不内耗人格」的豆包，token 便宜得像不要钱一样的 DeepSeek，以及专业的 GPT、Gemini，还有现在爆火的 Codex、Claude，都在一步步改写这个时代。',
      '我一直坚信，AI 不会淘汰所有人，只会淘汰不使用 AI 的人。处在时代洪流之中的我们，就像问父母在中国改革开放时期为什么没有抓住风口一样——我们能不能抓住当今全世界盛行的 AI 风口？AI 的路还很长，人类的未来难以想象。',
      '坚持每天阅读论文、试用产品、写自己的 demo——只有亲手做过，才有资格谈论它的未来。',
    ],
  },
  {
    id: 'embodied',
    title: '具身智能',
    en: 'Embodied AI',
    desc: '相信下一波浪潮会从屏幕走向物理世界。',
    detail: [
      '从大语言模型到机器人，从软件到具身——智能终将走出屏幕，走进真实世界。',
      '其实我真的不懂这个行业，但还是把它纳入到了我的爱好当中，因为我十分迷恋科技——而既然迷恋科技，机器人就一定是逃不掉的。',
      '上班路上我总是幻想：将来的某一天，这条路上会走着好多机器人，他们有部分自主的意识，当然大部分还是为了服务于人——那会是多么有趣的画面。',
      '我也会幻想，如果有一天能研制出一个动作轻巧、行动迅速的「真钢铁侠」，那这个世界又会变成什么样子。期待科技的进步——',
    ],
  },
  {
    id: 'invest',
    title: '投资',
    en: 'Investing',
    desc: '把资本配置当作另一种思维训练。',
    detail: [
      '投资教会我两件事：尊重时间，尊重不确定性。',
      '它让我跳出一时的得失，去理解一家公司、一个行业、一个国家是如何长出来、又是如何消亡的。',
      '它不是我现在要做的、要学习的部分，但一定是我将来必不可少的部分。我认为在一个人拥有足够的资本之前，应该把努力的终点放在自我的建设和原始资本的积累上——只有这样，后续的投资才会显得有意义。',
      '所以我暂时把它搁置，但一直对它抱有兴致。',
    ],
  },
  {
    id: 'music',
    title: '听歌',
    en: 'Music',
    desc: '一天里最忠实的背景音。',
    detail: [
      '我喜欢听歌——从我出生那天起，"喜欢听歌"就是一个不可否认的事实。酷狗听了有六万分钟，网易云音乐九级，同时还在用 Apple Music。',
      '一天里闲出来的时间基本都在听歌，甚至读书时也会放一些舒缓的音乐，高一的高数课也在听歌……有一周，我每天平均听歌时间是 12 小时。',
      '我认为音乐是这个世界最伟大的发明。抒情的民谣和有节奏的外国歌掺杂在我的喜欢里，我尤其爱它们。',
    ],
  },
  {
    id: 'fitness',
    title: '健身',
    en: 'Fitness',
    desc: '把身体当作可以被复利的资产去打理。',
    detail: [
      '深蹲、硬拉、卧推。看似简单的动作，每一次都是对极限的小幅试探。',
      '比起 PR，我更看重那种"把汗流出来"之后的清醒——那是一天里最干净的时刻。',
      '我接触健身的时间比较晚，大二才开始；又因为从那时起，我一直在为自身的技术能力做锤炼和升级，所以陆陆续续健了两个月就被迫停止了——真的没时间。',
      '如果有时间，我保证我每天都会健身。我享受卧推、划船、高位下拉时心跳加速的感觉，喜欢练肩练背、练到上不去床——一个健康的身体，是成功的必要条件。',
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
            </div>
          </section>

          {/* 爱好详情 */}
          <div className="mt-24 space-y-24">
            {hobbies.map((hobby) => (
              <section key={hobby.id} id={hobby.id} className="scroll-mt-28">
                <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-8 reveal">
                  {hobby.title}
                </h3>

                {/* 详情段落 */}
                <div className="space-y-5 text-white/75 text-base md:text-lg leading-[1.9] max-w-3xl reveal reveal-delay-1">
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
