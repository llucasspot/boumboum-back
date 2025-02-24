import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export enum GenderName {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

/**
 * @swagger
 * components:
 *  schemas:
 *    Gender:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        name:
 *          type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *      required:
 *        - id
 *        - name
 *        - createdAt
 *        - updatedAt
 */
export default class Gender extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: GenderName

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  declare updatedAt: DateTime | null
}
