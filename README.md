<p align="center">
  <img src="web/public/logo.svg" width="96" alt="infinite-canvas logo">
</p>

<h1 align="center">视频创作台 (infinite-canvas)</h1>

视频创作台是一个浏览器端视频生成工具。配置 OpenAI 兼容接口后，可使用文本提示词以及图片、视频、音频参考素材生成视频。

> [!CAUTION]
> API Key、参考素材和生成记录默认保存在浏览器本地，AI 请求由浏览器直接发送至你配置的接口。请仅在可信环境中使用。

## 核心功能

- 视频生成：支持文本提示词、图片、视频和音频参考素材，以及任务轮询、预览、下载和生成记录。
- 模型配置：支持 OpenAI 兼容渠道、模型选择、视频比例、清晰度、时长、音频和水印等设置。
- 数据同步：可在设置中配置 WebDAV，同步本地生成记录与素材。

## 快速开始

```bash
git clone git@github.com:basketikun/infinite-canvas.git
cd infinite-canvas
docker compose up -d --build
```

访问 `http://localhost:3000`，然后在右上角设置中填写 `Base URL`、`API Key` 和视频模型。

## 文档

- [快速开始](docs/content/docs/overview/quick-start.mdx)
- [功能介绍](docs/content/docs/overview/features.mdx)
- [Docker 部署](docs/content/docs/overview/docker.mdx)
- [Render 部署](docs/content/docs/overview/render.mdx)
- [安全说明](SECURITY.md)

## 开源协议

本项目使用 GNU Affero General Public License v3.0，详见 [LICENSE](LICENSE)。
