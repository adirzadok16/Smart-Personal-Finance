import { Entity,Column, PrimaryColumn } from 'typeorm';

@Entity()
export class DashboardMonthlySummary {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  month!: number; // 1-12

  @PrimaryColumn()
  year!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalIncome!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalExpense!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance!: number;
}


@Entity()
export class DashboardCategorySummary {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  month!: number;

  @PrimaryColumn()
  year!: number;

  @PrimaryColumn()
  category!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;
}


@Entity()
export class DashboardRecentTransaction {
  @PrimaryColumn({ type: 'uuid' })
  transactionId!: string;

  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'varchar' })
  description!: string;

   @Column({ type: 'varchar' })
  category!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar' })
  date!: string;
}