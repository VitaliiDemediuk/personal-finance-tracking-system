export const typesInt: {[key: string]: number} = {
    expense: 0,
    income: 1,
};

export const getTypeString = (typeInt: number) => {
    switch (typeInt) {
        case typesInt.expense:
            return 'expense';
        case typesInt.income:
            return 'income';
    }
    return 'unknown';
};