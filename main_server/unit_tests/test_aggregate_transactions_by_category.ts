import { expect } from 'chai';
import { describe, it } from 'mocha';
import { aggregateTransactionsByCategory } from '../src/algorithms/aggregate_transactions_by_category.js';

describe('aggregateTransactionsByCategory', () => {
    it('Aggregates transactions by categories.', () => {
        const transactions = [
            { type: 'income', categoryId: 'salary', amount: 50000 },
            { type: 'income', categoryId: 'gifts', amount: 20000 },
            { type: 'income', categoryId: 'salary', amount: 30000 }
        ];

        const aggregated = aggregateTransactionsByCategory('income')(transactions);

        expect(aggregated).to.have.all.keys('salary', 'gifts');
        expect(aggregated.salary).to.deep.equal({ totalAmount: 80000, count: 2 });
        expect(aggregated.gifts).to.deep.equal({ totalAmount: 20000, count: 1 });
    });

    it('Considers transactions without a category.', () => {
        const transactions = [
            { type: 'income', amount: 30000 },
            { type: 'income', amount: 15000 }
        ];

        const aggregated = aggregateTransactionsByCategory('income')(transactions);

        expect(aggregated).to.have.key('Uncategorized');
        expect(aggregated.Uncategorized).to.deep.equal({ totalAmount: 45000, count: 2 });
    });

    it('Ignores transactions of unspecified type.', () => {
        const transactions = [
            { type: 'expense', categoryId: 'groceries', amount: 15000 },
            { type: 'income', categoryId: 'salary', amount: 50000 }
        ];

        const aggregated = aggregateTransactionsByCategory('income')(transactions);

        expect(aggregated).to.have.key('salary');
        expect(aggregated).to.not.have.key('groceries');
    });

    it('Correctly calculates the sum and quantity for a single category.', () => {
        const transactions = [
            { type: 'expense', categoryId: 'food', amount: 20000 },
            { type: 'expense', categoryId: 'food', amount: 10000 }
        ];

        const aggregated = aggregateTransactionsByCategory('expense')(transactions);

        expect(aggregated.food).to.deep.equal({ totalAmount: 30000, count: 2 });
    });

    it('Returns an empty object if there are no corresponding transactions.', () => {
        const transactions = [
            { type: 'income', categoryId: 'salary', amount: 50000 },
            { type: 'income', categoryId: 'bonus', amount: 15000 }
        ];

        const aggregated = aggregateTransactionsByCategory('expense')(transactions);

        expect(aggregated).to.deep.equal({});
    });

    it('Correctly calculates the sum with a large number of transactions.', () => {
        const transactions = [];
        for (let i = 0; i < 100; i++) {
            transactions.push({ type: 'expense', categoryId: 'misc', amount: 1000 });
        }

        const aggregated = aggregateTransactionsByCategory('expense')(transactions);

        expect(aggregated.misc).to.deep.equal({ totalAmount: 100000, count: 100 });
    });

    it('Correctly calculates the sum with different categories and types.', () => {
        const transactions = [
            { type: 'expense', categoryId: 'food', amount: 20000 },
            { type: 'expense', categoryId: 'utilities', amount: 5000 },
            { type: 'income', categoryId: 'salary', amount: 50000 },
            { type: 'expense', categoryId: 'food', amount: 15000 }
        ];

        const aggregated = aggregateTransactionsByCategory('expense')(transactions);

        expect(aggregated.food).to.deep.equal({ totalAmount: 35000, count: 2 });
        expect(aggregated.utilities).to.deep.equal({ totalAmount: 5000, count: 1 });
        expect(aggregated).to.not.have.key('salary');
    });
});
