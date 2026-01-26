import { Entity,Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Transaction_Table {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar' }) 
  user_id!: string;

  @Column({ type: 'varchar' })
  amount!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ type: 'varchar' })
  date!: string;
}