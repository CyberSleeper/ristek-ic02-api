import express, { Request, Response } from 'express'
import { uuid } from 'uuidv4'
import fs from 'fs'
import { ExpenseProps } from './interface'

const app = express()
const port = 3000

app.use(express.json())

const saveExpenseData = (data: ExpenseProps) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync('./data/expenses.json', stringifyData)
}

const getExpenseData = () => {
  const jsonData = fs.readFileSync('./data/expenses.json', 'utf-8')
  return JSON.parse(jsonData)
}

const getCategoryData = () => {
  const jsonData = fs.readFileSync('./data/category.json', 'utf-8')
  return JSON.parse(jsonData)
}

const getTotalExpense = () => {
  const jsonData = fs.readFileSync('./data/totalExpense.json', 'utf-8')
  return JSON.parse(jsonData)
}

app.get('/expense', async (req: Request, res: Response) => {
  const expensesData = getExpenseData()
  res.status(200).send(expensesData)
  return expensesData
})

// TODO: Add Validation
app.post('/expense', async (req: Request, res: Response) => {
  const expensesData = getExpenseData()
  const newExpenseData = req.body
  newExpenseData.id = uuid()

  expensesData.push(newExpenseData)
  saveExpenseData(expensesData)
  res.status(201).send({ success: true, msg: 'New data created successfully' })
})

app.get('/expense/category', async (req: Request, res: Response) => {
  const expensesData = getCategoryData()
  res.status(200).send(expensesData)
  return expensesData
})

app.get('/expense/total', async (req: Request, res: Response) => {
  const expensesData = getTotalExpense()
  res.status(200).send(expensesData)
  return expensesData
})

app.get('/expense/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()

  const expense = expensesData.filter( (expense: ExpenseProps) => expense.id === id)
  if (expense.length === 0) {
    return res.status(400).send({ error: true, msg: 'id not exists' })
  }
  
  res.status(200).send(expense[0])
  return expense
})

app.delete('/expense/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()

  const newExpensesData = expensesData.filter( (expense: ExpenseProps) => expense.id !== id)
  if (newExpensesData.length === expensesData.length) {
    return res.status(400).send({ error: true, msg: 'id not exists'})
  }

  saveExpenseData(newExpensesData)
  res.status(200).send({ success: true, msg: `Success delete expense with id ${id}`})
})

app.put('/expense/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()
  const newExpenseData = req.body
  
  const checkExist = expensesData.find( (expense: ExpenseProps) => expense.id === id)
  if (!checkExist) {
    return res.status(400).send({ error: true, msg: 'id not exists' })
  }
  
  for (var i = 0; i < expensesData.length; i++) {
    if (expensesData[i].id === id) {
      newExpenseData.id = id
      expensesData[i] = newExpenseData
      break
    }
  }

  saveExpenseData(expensesData)
  res.status(200).send({ success: true, msg: 'Success' })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
