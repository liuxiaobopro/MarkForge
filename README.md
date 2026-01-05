# MarkForge

MarkForge 是一个仿 typro 的 Markdown 文件浏览软件。

## 技术栈

### 前端
- React
- TypeScript
- Vite
- shadcn/ui

## 开发规范

代码尽可能封装组件或函数，便于复用。

## 项目配置

可以通过编辑 `wails.json` 来配置项目。更多项目设置信息请参考：
https://wails.io/docs/reference/project-config

## 开发模式

在项目目录下运行 `wails dev` 进入实时开发模式。这将启动一个 Vite 开发服务器，提供快速的前端热重载。如果想在浏览器中开发并访问 Go 方法，还有一个运行在 http://localhost:34115 的开发服务器。在浏览器中连接此地址，即可在开发者工具中调用 Go 代码。

## 构建

使用 `wails build` 构建可分发的生产模式包。
