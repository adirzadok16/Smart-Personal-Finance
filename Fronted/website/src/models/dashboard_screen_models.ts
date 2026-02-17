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
  monthlySummary: MonthlySummary[];
  categorySummary: MonthlyCategories[];
  recentTransactions: RecentTransaction[];
  currentMonthIncomeAndExpense: MonthlyIncomeExpense;
}