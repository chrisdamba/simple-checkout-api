import {Request, Response, NextFunction} from 'express'
import {body, validationResult} from 'express-validator'

export const validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({gt: 0}).withMessage('Price must be greater than zero'),
  body('stockLevel')
    .isInt({min: 0})
    .withMessage('Stock level must be a non-negative integer'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()})
    }
    next()
  },
]
