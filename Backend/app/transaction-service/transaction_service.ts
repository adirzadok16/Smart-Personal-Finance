import { createTransactionDto, deleteTransactionDto, Transaction, updateTransactionDto } from './transaction_models';
import { v4 as uuidv4 } from 'uuid';
import { Transaction_Table } from './transaction_schemas';
import { getServiceDatabase } from '../db/database';
import RabbitMQService from '../utilities/rabbitmq';
import { getMonthAndYear } from '../utilities/helpers';

export class TransactionService {

  /**
   * add_transaction
   * @param userId - ID of the user performing the transaction
   * @param dto - Data for the new transaction
   * 
   * What it does:
   *  - Validates amount and category
   *  - Generates a unique transaction ID
   *  - Creates and saves the transaction in the database
   *  - Publishes a transaction.created event to RabbitMQ
   * 
   * Returns: Promise<Transaction>
   */
  static async add_transaction(userId: string, dto: createTransactionDto) {
    console.log(`[ADD] Starting transaction creation for user: ${userId}`);

    if (dto.amount <= 0) {
      console.log(`[ADD] Invalid amount: ${dto.amount}`);
      throw new Error('Amount must be positive');
    }
    if (!dto.category) {
      console.log(`[ADD] Missing category`);
      throw new Error('Category is required');
    }

    const transactionId = uuidv4();
    console.log(`[ADD] Generated transaction ID: ${transactionId}`);

    const transaction: Transaction = {
      transaction_id: transactionId,
      user_id: userId,
      title: dto.title,
      amount: dto.amount,
      type: dto.type,
      category: dto.category,
      date: dto.date,
    };

    console.log(`[ADD] Getting database connection...`);
    const db = getServiceDatabase('transaction');
    const transactionRepo = db.getRepository(Transaction_Table);

    console.log(`[ADD] Creating transaction entity...`);
    const savedTransaction = transactionRepo.create(transaction);
    await transactionRepo.save(savedTransaction);
    console.log(`[ADD] Transaction saved successfully: ${savedTransaction.transaction_id}`);

    const { month, year } = getMonthAndYear(dto.date);

    console.log(`[ADD] Publishing event to RabbitMQ...`);
    await RabbitMQService.publish('transactions', 'transaction.created', {
      data: {
        transactionId: savedTransaction.transaction_id,
        userId: savedTransaction.user_id,
        amount: Number(savedTransaction.amount),
        category: savedTransaction.category,
        type: savedTransaction.type,
        month: month,
        year: year,
        date: savedTransaction.date,
        description: savedTransaction.title,
      }
    });
    console.log(`[ADD] Event published successfully.`);

    return savedTransaction;
  }

  /**
   * update_transaction
   * @param userId - ID of the user performing the update
   * @param dto - Updated transaction data
   * 
   * What it does:
   *  - Fetches the transaction from the database
   *  - Updates relevant fields
   *  - Saves the updated transaction
   */
  static async update_transaction(userId: string, dto: updateTransactionDto) {
    console.log(`[UPDATE] Starting transaction update for user: ${userId}, transaction: ${dto.transactionId}`);

    const db = getServiceDatabase('transaction');
    const transactionRepo = db.getRepository(Transaction_Table);

    console.log(`[UPDATE] Fetching transaction from DB...`);
    const transaction = await transactionRepo.findOne({
      where: { transaction_id: dto.transactionId, user_id: userId },
    });
    if (!transaction) {
      console.log(`[UPDATE] Transaction not found`);
      throw new Error("Transaction not found");
    }

    console.log(`[UPDATE] Updating transaction fields...`);
    transaction.title = dto.newTitle;
    transaction.amount = dto.newAmount;
    transaction.type = dto.type;
    transaction.category = dto.newCategory;
    transaction.date = dto.date;

    console.log(`[UPDATE] Saving updated transaction to DB...`);
    await transactionRepo.save(transaction);
    console.log(`[UPDATE] Transaction updated successfully: ${transaction.transaction_id}`);

    return transaction;
  }

  /**
   * delete_transaction
   * @param userId - ID of the user performing the deletion
   * @param dto - Data of the transaction to delete
   * 
   * What it does:
   *  - Fetches the transaction from the database
   *  - Deletes the transaction if it exists
   *  - Publishes a transaction.deleted event to RabbitMQ
   */
  static async delete_transaction(userId: string, dto: deleteTransactionDto) {
    console.log(`[DELETE] Starting transaction deletion for user: ${userId}, description: ${dto.title}`);

    const db = getServiceDatabase('transaction');
    const transactionRepo = db.getRepository(Transaction_Table);

    console.log(`[DELETE] Fetching transaction from DB...`);
    const transaction = await transactionRepo.findOne({
      where: { title: dto.title, user_id: userId },
    });
    if (!transaction) {
      console.log(`[DELETE] Transaction not found`);
      throw new Error("Transaction not found");
    }

    console.log(`[DELETE] Removing transaction from DB...`);
    await transactionRepo.remove(transaction);
    console.log(`[DELETE] Transaction removed successfully: ${transaction.transaction_id}`);

    const { month, year } = getMonthAndYear(dto.date);

    console.log(`[DELETE] Publishing deletion event to RabbitMQ...`);
    await RabbitMQService.publish('transactions', 'transaction.deleted', {
      transactionId: dto.transaction_id,
      userId: userId,
      amount: dto.amount,
      category: dto.category,
      type: dto.type,
      month: month,
      year: year,
      description: dto.title,
    });
    console.log(`[DELETE] Event published successfully.`);

    return transaction;
  }

  /**
   * get_transactions
   * @param userId - ID of the user
   * 
   * What it does:
   *  - Fetches all transactions for the given user from the database
   * 
   * Returns: Promise<Transaction[]>
   */
  static async get_transactions(userId: string) {
    console.log(`[GET] Fetching transactions for user: ${userId}`);
    const db = getServiceDatabase('transaction');
    const transactionRepo = db.getRepository(Transaction_Table);

    const transactions = await transactionRepo.find({ where: { user_id: userId } });
    console.log(`[GET] Found ${transactions.length} transactions.`);
    return transactions;
  }
}
