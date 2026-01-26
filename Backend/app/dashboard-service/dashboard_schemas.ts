import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('dashboard_summary')
export class DashboardSummary_Table {
  @PrimaryColumn()
  userId!: string;

  @Column({ default: 0 })
  totalIncome!: number;

  @Column({ default: 0 })
  totalExpense!: number;

  @Column({ default: 0 })
  balance!: number;

  @Column('json', { default: [] })
  categories!: {
    category: string;
    amount: number;
  }[];
}