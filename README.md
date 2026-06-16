# 极速机场 - 订阅售卖面板

高速稳定的网络加速服务订阅管理平台。

## 技术栈

- **前端**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **后端**: Supabase (PostgreSQL + Auth + RLS)
- **部署**: Vercel

## 功能

- 🔐 用户注册 / 登录（Supabase Auth）
- 📦 套餐展示与筛选（按周期 / 按流量）
- 💳 下单与模拟支付（服务端价格校验，防篡改）
- 📋 订单管理（待付款可继续支付）
- 📊 仪表盘（订阅概览 + 流量进度条）
- 👤 个人中心
- 📈 流量明细
- 🛡️ 全表 RLS 保护（用户只能看到自己的数据）

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 填入你的 Supabase URL 和 anon key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon（公开）密钥 |

## 数据库结构

| 表 | 说明 |
|----|------|
| `plans` | 套餐定义（价格、流量、特性） |
| `profiles` | 用户档案（注册时自动创建） |
| `orders` | 订单记录 |
| `subscriptions` | 订阅记录（支付成功后开通） |

### RPC 函数

- `create_order(p_plan_id)` — 创建订单，价格从 plans 表取
- `pay_order(p_order_id)` — 模拟支付，标记已付并开通订阅

## 套餐

| 名称 | 价格 | 周期 | 流量 |
|------|------|------|------|
| 年付每月200G | ¥12/年 | 年付 | 200GB/月 |
| 月付1000G | ¥5/月 | 月付 | 1000GB |
| 月付3000G-高级套餐 | ¥10/月 | 月付 | 3000GB |
| 不限时200G套餐 | ¥8 | 一次性 | 200GB |
| 不限时2000G套餐 | ¥30 | 一次性 | 2000GB |
| 不限时6000G套餐 | ¥60 | 一次性 | 6000GB |

## 项目结构

```
src/
├── app/
│   ├── dashboard/       # 面板页面
│   │   ├── plans/       # 购买订阅
│   │   ├── orders/      # 我的订单
│   │   ├── profile/     # 个人中心
│   │   ├── usage/       # 流量明细
│   │   └── ...          # 其他占位页
│   ├── login/           # 登录
│   ├── register/        # 注册
│   └── layout.tsx       # 根布局
├── components/          # 客户端组件
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── PlansClient.tsx
│   └── OrdersClient.tsx
└── lib/
    ├── supabase/        # Supabase 客户端封装
    └── types.ts         # 类型定义
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com/import) 导入项目
3. 添加环境变量
4. 部署完成后，去 Supabase → Auth → URL Configuration 添加 Redirect URL：
   ```
   https://你的域名.vercel.app/**
   ```

## License

MIT
