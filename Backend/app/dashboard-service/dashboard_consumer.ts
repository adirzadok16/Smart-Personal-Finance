import { RabbitMQService } from '../utilities/rabbitmq';
import { DashboardService } from './dashboard_service';
import { TransactionCreatedEvent } from './dashboard_models';

export async function startDashboardSubscriber() {
  
  await RabbitMQService.subscribe(
    'transactions',
    'dashboard-service-queue',
    ['transaction.created'],
    async (event: TransactionCreatedEvent) => {
      const summary =
        await DashboardService.handleTransactionCreated(event);

      // כאן קל מאוד:
      // DashboardGateway.emit(event.userId, summary);
    }
  );
}