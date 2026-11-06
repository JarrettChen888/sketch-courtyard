# 素描小院 · 零基础慢慢画

一个给 50 岁左右、零基础想学素描的女性做的中文学习网站：8 节小课 + 学会上网找资料 + 可打印练习纸。

- 公网地址：https://jarrettchen888.github.io/sketch-courtyard/
- 纯静态，无后端、无第三方统计、无外部字体/CDN；手机优先，可调字号、可朗读、可夜间、可打印。

## 本地预览

```bash
cd "/Users/jarrett/Desktop/DSH/项目/素描小院"
python3 -m http.server 8137
# 打开 http://127.0.0.1:8137/
```

## 改内容

内容都在 `content/`：

| 文件 | 内容 |
|---|---|
| `content/lessons.json` | 8 节课（目标、准备、步骤、常见错误、练习、小结） |
| `content/search-guide.json` | 学会上网找资料（搜索四步法、关键词、平台、判断、保存、安全、练习、FAQ） |
| `content/faq.json` | 全站常见问题 10 条 |

改完运行：

```bash
node build.mjs   # 重新生成 14 个 HTML 页面 + sitemap/robots/manifest
git add -A && git commit -m "content: update" && git push
```

## 目录

```
build.mjs            静态站点生成器（页面模板 + 内容渲染）
content/             内容 JSON
assets/style.css     设计系统（大字、暖纸感、夜间、打印）
assets/app.js        字号/主题/进度/朗读/搜索平台切换/打印
assets/img/*.svg     手绘风示意图、练习纸、插画
*.html               生成结果（GitHub Pages 直接发布，勿手改）
```

## 部署

GitHub Pages：仓库 `JarrettChen888/sketch-courtyard`，`main` 分支根目录发布。

## 设计取舍

- 面向 50+ 女性：正文 19px 起、三档字号、行高 1.85、正文对比度约 13:1、每课 15–25 分钟可完成。
- 不用外部字体与 CDN（国内访问稳定）；不收集任何数据，学习进度只存 localStorage。
- 示意图像素文字在手机上偏小，图片可点开看原图放大。
