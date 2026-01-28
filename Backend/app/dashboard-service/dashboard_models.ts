export interface TransactionCreatedEvent {
  transactionId: string;
  userId: string;
  amount: number;
  category: string;
  type: string;
  month: number;
  year: number;
  date: string;
  description: string;
}

export interface TransactionUpdatedEvent {
  transactionId: string;
  userId: string;
  oldAmount: number;
  newAmount: number;
  type: string;
  oldCategory: string;
  newCategory: string;
  date: string;
  month: number;
  year: number;
  oldDescription: string;
  newDescription: string;
}

export interface TransactionDeletedEvent {
  transactionId: string;
  userId: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  month: number;
  year: number;
  description: string;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}