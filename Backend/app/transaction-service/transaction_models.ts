export interface Transaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  description: string;
}

export interface createTransactionDto {
  amount: number;
  category: string;
  type: string;
  date: string;
  description: string;
}



export interface updateTransactionDto {
  transactionId: string;
  oldAmount: number;
  newAmount: number;
  type: string;
  oldCategory: string;
  newCategory: string;
  date: string;
  oldDescription: string;
  newDescription: string;
}

export interface deleteTransactionDto {
  transaction_id: string;
  amount: number;
  type: string; 
  category: string;
  date: string;
  description: string;
}