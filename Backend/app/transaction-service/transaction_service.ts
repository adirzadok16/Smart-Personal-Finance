import { CreateTransactionDto, Transaction } from './transaction_models'
import { v4 as uuidv4 } from 'uuid';
import { Transaction_Table } from './transaction_schemas';
import { getServiceDatabase } from '../db/database';
import { RabbitMQService } from '../utilities/rabbitmq';


export class TransactionService {


    // private static ds = getServiceDatabase('transaction');
    // private static transactionRepo = this.ds.getRepository(Transaction_Table);



    static async add_transaction(userId: string, json: CreateTransactionDto) {
        try {
            const transactionId = uuidv4();
            const transaction: Transaction = {
                id: transactionId,
                user_id: userId,
                description: json.description,
                amount: json.amount,
                type: json.type,
                category: json.category,
                date: json.date,
            }
            const ds = getServiceDatabase('transaction');
            const transactionRepo = ds.getRepository(Transaction_Table);

            const newTransaction = transactionRepo.create(transaction);
            await transactionRepo.save(newTransaction);
            RabbitMQService.publish('transactions', 'transaction.created', {
                transactionId: newTransaction.id,
                userId: newTransaction.user_id,
                amount: newTransaction.amount,
                category: newTransaction.category,
                type: newTransaction.type,
                date: newTransaction.date,
            });
            return newTransaction;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    static async update_transaction(userId: string, json: any) {
        try {
            const transaction = await getServiceDatabase('transaction').getRepository(Transaction_Table).findOne({ where: { description: json.description, user_id: userId } });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            transaction.description = json.description;
            transaction.amount = json.amount;
            transaction.type = json.type;
            transaction.category = json.category;
            transaction.date = json.date;
            await getServiceDatabase('transaction').getRepository(Transaction_Table).save(transaction);
            return transaction;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    static async delete_transaction(userId: string, json: any) {
        try {
            const transaction = await getServiceDatabase('transaction').getRepository(Transaction_Table).findOne({ where: { description: json.description, user_id: userId } });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            await getServiceDatabase('transaction').getRepository(Transaction_Table).remove(transaction);
            return transaction;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async get_transactions(userId: string) {
        try {
            const transactions = await getServiceDatabase('transaction').getRepository(Transaction_Table).find({ where: { user_id: userId } });
            return transactions;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}