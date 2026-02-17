import RabbitMQService from '../../utilities/rabbitmq';
import { processTransaction } from './dashboard-consumer-controller';


export async function startDashboardSubscriber() {
  await RabbitMQService.subscribe(
    'transactions',
    'dashboard-service-queue',
    ['transaction.created', 'transaction.updated', 'transaction.deleted'],
    async (event: any, routingKey: string) => {
      try {
        console.log('Received event:', event);
        switch (routingKey) {
          case 'transaction.created':
            await processTransaction(event.data, 'create');
            break;

          case 'transaction.updated':
            await processTransaction(event.data, 'update');
            break;

          case 'transaction.deleted':
            await processTransaction(event.data, 'delete');
            break;

          default:
            console.warn(`Unhandled event type: ${routingKey}`);
        }
      } catch (error) {
        console.error(`Error handling event ${routingKey}:`, error);
      }
    }
  );
}
