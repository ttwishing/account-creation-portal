import { customAlphabet } from 'nanoid'

export const randomCode = customAlphabet(
    '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
    22
)
