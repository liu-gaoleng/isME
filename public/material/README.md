# 静态素材目录 / Static Material

此目录下存放网站使用的图片素材。Next.js 会把 `public/` 目录中的文件
直接通过 URL 公开访问，例如：

  public/material/experiences/sunshine/01.jpg
  → https://your-site/material/experiences/sunshine/01.jpg

## 目录规范

```
material/
├── works/                          作品图片
├── experiences/                    经历章节图片（一个章节一个子目录）
│   ├── supermarket/
│   ├── sunshine/                   神思电子
│   ├── bytedance/
│   └── next/                       「$...」未来章节
└── hobbies/                        爱好图片
    ├── coding/
    ├── reading/
    └── visuals/
```

## 文件命名建议

- 全部 **小写 + 短横线**，例如 `team-photo.jpg`，避免中文 / 空格
- 同一组按顺序：`01.jpg / 02.jpg / 03.jpg`，方便循环引用
- 推荐格式：`.jpg` 或 `.webp`（WebP 体积更小、质量相近）
- 上传前压缩，单文件建议 ≤ 500KB（首屏大图）/ ≤ 300KB（缩略图）

## 在代码中引用

代码里以根 URL（不含 `/public`）引用：

```tsx
{ src: '/material/experiences/sunshine/01.jpg', caption: '工位的清晨' }
```

## 在哪里修改 / 配置

- 经历章节的图片列表：`app/about/page.tsx` 顶部 `experiences` 数组
- 作品/爱好等：相关 Page 组件中的常量数组
