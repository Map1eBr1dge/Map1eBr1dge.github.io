# 更新日志

## 2026-08-06

### 内容修正
- **contact.html**: 删除邮箱转发描述和反馈表单（空壳无实际功能）
- **bluetidy.html**: 修正技术栈（Python/PySide6 → Rust/Tauri 2/React）、平台（跨平台 → 仅 Windows 10/11 x64）、版本（v1.2 → v0.2.0 Preview），删除 pip install 安装命令
- **ctf-qiankun.html**: 修正产品形态（浏览器扩展 → 纯前端 SPA）、技术栈（JavaScript/WebExtension → TypeScript/Vue/NestJS），删除 Chrome 商店安装描述
- **lannook.html**: 修正版本（v0.8 → v26.2.1）、传输协议（WebRTC/TLS → HTTP/WebSocket 明文），删除断点续传/P2P 直连/ cargo install 等不实描述
- **structvis.html**: 修正技术栈（JavaScript/Canvas/D3 → Svelte 5/SvelteKit/TypeScript），补充实际数据（18 引擎/23 页面/150 测试用例）
- **cryptovis.html**: 修正技术栈（JavaScript/Canvas/D3 → React 19/TypeScript/anime.js/KaTeX）、状态（活跃维护中 → 设计阶段·开发中），删除"开源"标签

### 批量修正
- 所有页面导航栏 CTF 乾坤袋描述：浏览器扩展工具 → CTF 工具箱（16 处）
- 所有页面 Pagefind 初始化脚本：移除无效的 `#__pf_dummy` 选择器（19 处）
- 公告页、RSS、首页预览中的 LanNook/CTF 乾坤袋版本和描述