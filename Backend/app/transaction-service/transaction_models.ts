export interface Transaction {
  id: string;
  user_id: string;
  amount: string;
  category: string;
  type: string;
  date: string;
  description: string;
}

export interface CreateTransactionDto {
  amount: string;
  category: string;
  type: string;
  date: string;
  description: string;
}