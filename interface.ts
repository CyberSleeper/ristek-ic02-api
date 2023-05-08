export interface ExpenseProps {
  id: string;
  name: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
}

export interface CategoryProps {
  id: string;
  name: string;
}

export interface TotalExpenseProps {
  total_expenses: number
}