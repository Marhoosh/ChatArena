# 将聊天记录从 Storage 迁移到数据库

## 1. 创建新的数据库聊天历史服务
- 创建 `src/services/chat-history-db.ts`，使用数据库服务替代 storage
- 实现以下函数：
  - `loadHistoryMessages(botId)` - 从数据库加载历史消息
  - `setConversationMessages(botId, conversationId, messages)` - 保存消息到数据库
  - `deleteHistoryMessage(botId, conversationId, messageId)` - 删除单条消息
  - `clearHistoryMessages(botId)` - 清空所有历史消息

## 2. 数据模型转换
- 实现 Storage 模型与数据库模型之间的转换
- 处理 `createdAt` (number) 与 `created_at` (string) 的转换
- 处理 `image` (Blob) 与 `image_url` (string) 的转换
  - 注：目前数据库中存储的是 image_url，项目还未实现将上传的 image 转化为 image_url 的功能，暂时不用实现其细节，留待后续实现
- 处理 `error` (ChatError) 与 `error_code/error_message` 的转换

## 3. 更新使用 chat-history 的文件
- 修改 `src/app/hooks/use-chat.ts` - 使用新的数据库服务
- 修改 `src/app/components/History/Content.tsx` - 使用新的数据库服务
- 修改 `src/app/components/History/Dialog.tsx` - 使用新的数据库服务
- 修改 `src/app/components/History/ChatMessage.tsx` - 使用新的数据库服务

## 4. 处理 user_id
- 系统已有用户认证功能
- 使用 `getSessionUser()` 或 `getCurrentUserId()` 获取当前用户 ID

## 5. 测试验证
- 验证所有聊天历史功能正常工作
- 验证消息的保存、加载、删除功能
- 验证历史记录的显示和搜索功能