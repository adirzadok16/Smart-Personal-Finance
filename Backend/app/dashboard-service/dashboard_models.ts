export interface TransactionCreatedEvent {
  transactionId: string;
  userId: string;
  amount: number;
  category: string;
  type: string;
  month: number;
  year: number;
  date: string;
  title: string;
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
  oldTitle: string;
  newTitle: string;
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
  title: string;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}


export interface MonthlySummary {
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  userId: string;
  month: number;
  year: number;
  category: string;
  amount: number;
}

export interface RecentTransaction {
  transactionId: string;
  userId: string;
  title: string;
  category: string;
  type: string;
  amount: number;
  date: string;
}

export interface MonthlyIncomeExpense {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyCategories {
  month: number;
  year: number;
  categories: { category: string; amount: number }[];
}

export interface DashboardCache {
  currentMonthIncomeAndExpense: MonthlyIncomeExpense;
  monthlySummary: MonthlySummary[];
  categorySummary: MonthlyCategories[];
  recentTransactions: RecentTransaction[];
}