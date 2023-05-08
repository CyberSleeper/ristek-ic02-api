import express, { Request, Response } from 'express'
import { uuid } from 'uuidv4'
import { z } from 'zod'
import fs from 'fs'
import { CategoryProps, ExpenseProps, TotalExpenseProps } from './interface'

const app = express()
const port = 3000

app.use(express.json())

const saveExpenseData = (data: ExpenseProps[]) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync('./data/expenses.json', stringifyData)
}

const getExpenseData = (): ExpenseProps[] => {
  const jsonData = fs.readFileSync('./data/expenses.json', 'utf-8')
  return JSON.parse(jsonData) as ExpenseProps[]
}

const getCategoryData = (): CategoryProps[] => {
  const jsonData = fs.readFileSync('./data/category.json', 'utf-8')
  return JSON.parse(jsonData) as CategoryProps[]
}

const ExpenseData = z.object({
  amount: z.number().nonnegative(),
  category: z.union([
    z.literal('fa8337a7-a4b7-4257-a322-9d51473d9fc4'),
    z.literal('0c1dab86-8538-498f-af58-17b54de01d3d'),
    z.literal('3d73aaae-d2cf-441c-9a91-5c2ab7c1f5ed'),
    z.literal('3f5d8771-e77a-402e-833d-66eeffaeae16')
  ]),
  name: z.string(),
})

const validate = (inputs: unknown) => {
  const isValidData = ExpenseData.safeParse(inputs)
  return isValidData.success
}

const getTotalExpense = (): TotalExpenseProps => {
  const jsonData = fs.readFileSync('./data/totalExpense.json', 'utf-8')
  return JSON.parse(jsonData) as TotalExpenseProps
}

app.get('/expense', (req: Request, res: Response) => {
  const { category_id, min_price, max_price } = req.query

  const expensesData = getExpenseData().filter(expense => 
    (!!category_id ? (category_id === expense.category.id) : true) &&
    (!!min_price ? (+min_price! <= expense.amount) : true) &&
    (!!max_price ? (+max_price! >= expense.amount) : true)
  )
  res.status(200).send(expensesData)
  return expensesData
})

// TODO: Add Validation
app.post('/expense', (req: Request, res: Response) => {
  const expensesData = getExpenseData()
  const newExpenseData = req.body
  const categoryData = getCategoryData().find((category) => (category.id === newExpenseData.category)) as CategoryProps
  if (!validate(newExpenseData)) {
    return res.status(400).send({ error: true, msg: 'invalid data' })
  }

  newExpenseData.id = uuid()
  newExpenseData.category = categoryData

  expensesData.push(newExpenseData)
  saveExpenseData(expensesData)
  res.status(201).send({ success: true, msg: 'New data created successfully' })
})

app.get('/expense/category', (req: Request, res: Response) => {
  const expensesData = getCategoryData()
  res.status(200).send(expensesData)
  return expensesData
})

app.get('/expense/total', (req: Request, res: Response) => {
  const expensesData = getTotalExpense()
  res.status(200).send(expensesData)
  return expensesData
})

app.get('/expense/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()

  const expense = expensesData.filter( expense => expense.id === id)
  if (expense.length === 0) {
    return res.status(400).send({ error: true, msg: 'id not exists' })
  }
  
  res.status(200).send(expense[0])
  return expense
})

app.delete('/expense/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()

  const newExpensesData = expensesData.filter( expense => expense.id !== id)
  if (newExpensesData.length === expensesData.length) {
    return res.status(400).send({ error: true, msg: 'id not exists'})
  }

  saveExpenseData(newExpensesData)
  res.status(200).send({ success: true, msg: `Success delete expense with id ${id}`})
})

app.put('/expense/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const expensesData = getExpenseData()
  const newExpenseData = req.body
  const categoryData = getCategoryData().find((category) => (category.id === newExpenseData.category)) as CategoryProps
  if (!validate(newExpenseData)) {
    return res.status(400).send({ error: true, msg: 'invalid data' })
  }

  newExpenseData.category = categoryData
  
  const checkExist = expensesData.find( expense => expense.id === id)
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
