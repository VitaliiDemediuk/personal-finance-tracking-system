export const typesInt: {[key: string]: number} = {
    expense: 0,
    income: 1,
};

export const getTypeString = (typeInt: number) => {
    const typesStr: { [key: number]: string } = {
        0: 'expense',
        1: 'income',
    };
    return typesStr[typeInt] || 'unknown';
};