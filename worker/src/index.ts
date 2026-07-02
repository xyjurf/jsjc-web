import { getLogger } from "./logger";
import { getSupabase } from "./db";
import { claimNextOrder, failOrder } from "./db";
import { fulfillOrder } from "./fulfillment";

const log = getLogger();
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 5000;

async function main() {
  log.info("=== 极速机场 Worker 启动 ===");
  log.info({ pollInterval: POLL_INTERVAL }, "配置");

  // Verify Supabase connection
  try {
    const { data, error } = await getSupabase().from("orders").select("count");
    if (error) throw error;
    log.info("Supabase 连接成功");
  } catch (err: any) {
    log.fatal({ error: err.message }, "Supabase 连接失败，退出");
    process.exit(1);
  }

  // Main loop: poll for paid orders
  while (true) {
    try {
      const order = await claimNextOrder();

      if (order) {
        log.info({ orderId: order.id, planName: order.plan_name }, "收到新订单，开始处理...");
        await fulfillOrder(order.id);
      }
    } catch (err: any) {
      log.error({ error: err.message }, "主循环异常");
    }

    await sleep(POLL_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  log.info("收到 SIGINT，正在退出...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  log.info("收到 SIGTERM，正在退出...");
  process.exit(0);
});

main().catch((err) => {
  log.fatal({ error: err.message }, "Worker crash");
  process.exit(1);
});