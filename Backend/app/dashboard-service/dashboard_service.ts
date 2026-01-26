import { getServiceDatabase } from '../db/database';
import { DashboardSummary_Table } from './dashboard_schemas';
import { TransactionCreatedEvent } from './dashboard_models';
import RedisService from '../utilities/redis_service';

export class DashboardService {
  static getRedisKey(userId: string) {
    return `dashboard:${userId}`;
  }

  static async handleTransactionCreated(event: TransactionCreatedEvent) {
    const ds = getServiceDatabase('dashboard');
    const repo = ds.getRepository(DashboardSummary_Table);

    let summary = await repo.findOneBy({ userId: event.userId });

    if (!summary) {
      summary = repo.create({
        userId: event.userId,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: [],
      });
    }

    // ---- Update values ----
    if (event.type === 'income') {
      summary.totalIncome += event.amount;
      summary.balance += event.amount;
    } else {
      summary.totalExpense += event.amount;
      summary.balance -= event.amount;
    }

    const category = summary.categories.find(
      c => c.category === event.category
    );

    if (category) {
      category.amount += event.amount;
    } else {
      summary.categories.push({
        category: event.category,
        amount: event.amount,
      });
    }

    // ---- Save DB ----
    await repo.save(summary);

    // ---- Update Redis ----
    const redisKey = this.getRedisKey(event.userId);
    await RedisService.set(redisKey, JSON.stringify(summary));

    return summary;
  }

  // -----------------------
  // Read from Redis first
  // -----------------------
  static async getDashboard(userId: string) {
    const redisKey = this.getRedisKey(userId);

    const cached = await RedisService.get(redisKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // fallback ל-DB
    const ds = getServiceDatabase('dashboard');
    const repo = ds.getRepository(DashboardSummary_Table);
    const summary = await repo.findOneBy({ userId });

    if (summary) {
      await RedisService.set(redisKey, JSON.stringify(summary), 60); // TTL optional
    }

    return summary;
  }
}
