export interface TransactionCreatedEvent {
  transactionId: string;
  userId: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}