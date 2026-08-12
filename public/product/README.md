# 产品截图存放目录

把 App 的截图直接放进这个文件夹（`public/product/`），然后在
`app/blog/page.tsx` 中对应产品的 `images` 数组里引用：

```ts
images: [
  { src: '/product/app-home.png', alt: 'App 首页截图', caption: '首页' },
  { src: '/product/app-detail.png', alt: '详情页截图', caption: '详情页' },
],
```

说明：

- `src` 以 `/product/` 开头（public 目录下的文件会原样映射到站点根路径）
- 支持 png / jpg / webp；建议单张不超过 500KB（可运行 `node scripts/compress-images.mjs` 压缩）
- 竖屏手机截图效果最好，页面会按 2（手机）/ 3（平板）/ 4（桌面）列自动排列
- `caption` 可省略，不填则不显示图注
