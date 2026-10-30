# dsh-agy-link-delete-top

隐藏 DeepSeek Harness（DSH）会话顶部的 AGY 账号标识。

安装 [dsh-agy-link](https://github.com/amlyczz/dsh-agy-link) 后，每个会话顶部会出现一个 AGY 账号徽章（点亮的绿点 + 当前账号）。该插件 0.4.70 版本没有提供隐藏开关，本插件用一条 CSS 规则把它隐藏，其余功能不受影响。

## 效果

安装前（会话顶部的 AGY 徽章）：

![before](docs/before.png)

安装后（徽章隐藏，工具栏其余部分不变）：

![after](docs/after.png)

## 原理

dsh-agy-link 的客户端在 `conversation.session.header.actions` 插槽注册了 `agy-link-status` 组件，渲染出这个按钮。本插件不改动它的文件、不卸载组件，只注入一段样式，匹配它的稳定特征并将其 `display: none`：

- `button.agy-btn`，`title` 以 “Antigravity” 开头（四种语言一致）
- 背景使用 `--agy-bg-header` 变量（区别于 AGY 控制台内的其他按钮）
- 徽章外层的单子元素包裹容器一并折叠，避免留下空位

因此：

- AGY 登录、模型调用、账号池、额度刷新全部正常
- 设置页的 Antigravity 管理入口保留
- 控制台弹窗通过 portal 渲染到 `document.body`，不受影响
- 禁用或卸载本插件后徽章立即恢复显示

## 安装

从 [Releases](https://github.com/liubaicai/dsh-agy-link-delete-top/releases) 下载 `dsh-agy-link-delete-top-<version>.tgz`。

桌面端（Electron 应用）的插件由应用管理：将 tgz 放入 `~/.dsh/plugins/`，在 设置 → 插件 中安装本地包。

命令行管理的配置（web、headless 等）：

```bash
dsh plugin --profile web add /path/to/dsh-agy-link-delete-top-0.1.0.tgz
```

安装后刷新 DSH 页面即可生效。

## 恢复显示

在 设置 → 插件 中停用或移除本插件，徽章立即恢复显示。命令行配置也可以：

```bash
dsh plugin --profile web remove dsh-agy-link-delete-top
```

## 兼容性说明

- 针对 dsh-agy-link 0.4.70 的徽章结构编写。徽章的 `title` 前缀与背景变量在上游变更前都保持稳定；若某次升级后徽章重新出现，通常是选择器特征变了，更新本插件即可，不会影响 dsh-agy-link 本身。
- 需要浏览器支持 `:has()`（Chrome 105+ / Edge 105+；DSH 桌面端与网页端均满足）。

## 开发

```bash
npm install
npm test        # jsdom 验证隐藏规则与边界情况
npm pack        # 产出可安装的 .tgz
```

测试覆盖：徽章与其包裹层被隐藏；非 Antigravity 标题或无该背景变量的按钮不受影响；含其他兄弟元素的容器不被折叠；portal 到 body 的控制台不受影响；插件卸载时样式随之移除。

## License

[MIT](LICENSE)
