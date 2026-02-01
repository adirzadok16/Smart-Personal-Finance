export interface Transaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  title: string;
}

export interface createTransactionDto {
  amount: number;
  category: string;
  type: string;
  date: string;
  title: string;  
}



export interface updateTransactionDto {
  transactionId: string;
  oldAmount: number;
  newAmount: number;
  type: string;
  oldCategory: string;
  newCategory: string;
  date: string;
  oldTitle: string;
  newTitle: string;
}

export interface deleteTransactionDto {
  transaction_id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  title: string;
}