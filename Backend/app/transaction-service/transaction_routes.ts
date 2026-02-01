import { Router } from "express";
import { TransactionService } from "./transaction_service";
import { authMiddleware } from "../utilities/auth_middleware";
import { Transaction } from "./transaction_models";


export const transactionRoutes = Router();

transactionRoutes.post('/addTransaction', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user;
    const transaction: Transaction = await TransactionService.add_transaction(userId, req.body);
    res.status(201).json({ message: "Transaction added successfully", success: true, transaction: transaction.transaction_id })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add transaction", success: false, error: error });
  }
});

transactionRoutes.delete('/deleteTransaction', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user;
    const transaction: Transaction = await TransactionService.delete_transaction(userId, req.body);
    res.status(200).json({ message: "Transaction deleted successfully", success: true, transaction: transaction.transaction_id })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete transaction", success: false, error: error });
  }
});


transactionRoutes.put('/updateTransaction', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user;
    const transaction: Transaction = await TransactionService.update_transaction(userId, req.body);
    res.status(200).json({ message: "Transaction updated successfully", success: true, transaction: transaction.transaction_id })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update transaction", success: false, error: error });
  }
});


transactionRoutes.get('/getTransactions', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user;
    const transactions: Transaction[] = await TransactionService.get_transactions(userId);
    res.status(200).json({ message: "Transactions fetched successfully", success: true, transactions: transactions })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transaction", success: false, error: error });
  }
});


