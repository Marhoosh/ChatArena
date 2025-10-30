# ChatHub Web

ChatHub Web 是一个全功能的聊天机器人客户端，允许您在一个地方使用多个聊天机器人。

## 部署

### 使用 Docker

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/chathub.git
cd chathub
```

2. 使用 docker-compose 部署：
```bash
docker-compose up -d
```

3. 访问 http://localhost:3000

### 手动部署

1. 安装依赖：
```bash
yarn install
```

2. 构建项目：
```bash
yarn build
```

3. 将 `dist` 目录部署到任何静态文件服务器（如 Nginx、Apache 等）

### 使用 Nginx

如果您想手动配置 Nginx，可以使用提供的 `nginx.conf` 文件作为参考。

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | production |

## 与扩展版本的区别

1. 不需要浏览器扩展权限
2. 使用 localStorage/IndexedDB 替代扩展存储 API
3. 某些扩展特有功能（如快捷键、标签页管理）在 Web 版本中不可用
4. 适用于任何现代浏览器，无需安装扩展

## 开发

1. 安装依赖：
```bash
yarn install
```

2. 启动开发服务器：
```bash
yarn dev
```

3. 访问 http://localhost:5173

## 许可证

[许可证信息]