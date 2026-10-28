# Slash（redisread fork）

这是 [redisread/slash](https://github.com/redisread/slash)，fork 自 [yourselfhosted/slash](https://github.com/yourselfhosted/slash)。Slash 是开源、自托管的短链接与链接管理平台；原项目及其贡献者拥有原有代码的著作权，本仓库在上游基础上保留个人使用所需的扩展功能。

本次同步上游 `main` 至 [`e5a4508`](https://github.com/yourselfhosted/slash/commit/e5a4508b797a5fbdd7c633146152b14a5aba9061)。本仓库不是上游官方发行版。

![Slash 界面](./docs/assets/demo.png)

## 功能

- 创建易读的 `s/` 短链接，使用标签分类和搜索。
- 通过集合组织链接，支持工作区共享、公开访问和访问分析。
- 浏览器扩展支持快捷访问链接。

本 fork 保留了浏览器 HTML 书签导入（跳过已有 URL）、链接 JSON 导出、批量删除链接、批量添加／覆盖／删除标签、集合内搜索，以及扩展弹窗搜索和键盘选择功能。JSON 导出用于保存链接列表，不是完整数据库备份。

## 构建和运行本 fork

从当前仓库构建镜像，才能包含本 fork 的改动：

```bash
git clone https://github.com/redisread/slash.git
cd slash
docker build -t slash-fork:local .
docker run -d --name slash \
  -p 5231:5231 \
  -v "$HOME/.slash:/var/opt/slash" \
  slash-fork:local
```

打开 <http://localhost:5231>，按页面提示创建管理员账号。数据存放在挂载目录中。升级已有实例前，请备份数据目录；使用 PostgreSQL 时请备份对应数据库。本次上游同步包含数据库迁移：**原 `PRIVATE` 链接和集合会改为 `WORKSPACE`，即工作区共享，不再仅创建者可见。** 多用户实例升级前应逐项确认这些内容是否适合共享，并先使用备份副本验证升级。

上游镜像 `yourselfhosted/slash` 和浏览器商店中的官方扩展由上游发布，不包含本 fork 的定制代码。本仓库的主分支工作流配置为发布 `victorhongdream/slash:test`，是否发布成功以对应 Actions 运行为准。

## 本地开发

网页端使用 Node.js 22 和 `package.json` 固定的 pnpm 版本；后端最低要求 Go 1.23，`go.mod` 指定的工具链为 Go 1.24.2（Go 可自动下载）。

```bash
cd frontend/web
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

在仓库根目录另开终端启动后端：

```bash
go run ./bin/slash/main.go --mode dev
```

网页端检查：`pnpm lint`、`pnpm type-check`、`pnpm build`。后端测试：`go test ./...`。

## 浏览器扩展

```bash
cd frontend/extension
pnpm install --frozen-lockfile
pnpm build
```

在 Chromium 浏览器的扩展管理页面启用开发者模式，加载 `frontend/extension/build/chrome-mv3-prod`。在扩展设置中填写实例 URL 和该实例签发的访问令牌；可使用 `Alt+E` 打开搜索，方向键选择结果，回车打开链接。快捷键可在浏览器的扩展快捷键设置中调整。

扩展保留本 fork 的令牌配置、创建链接和搜索功能，并适配当前上游 API；可见性使用工作区或公开两种选项。

## 文档与来源

- [上游项目](https://github.com/yourselfhosted/slash)
- [安装说明](./docs/install.md)
- [Shortcuts 使用指南](./docs/getting-started/shortcuts.md)
- [Collections 使用指南](./docs/getting-started/collections.md)
- [上游浏览器扩展说明](./docs/install-browser-extension.md)

遵循仓库中的 [GNU AGPL v3 许可证](./LICENSE)。感谢上游作者和所有贡献者。
