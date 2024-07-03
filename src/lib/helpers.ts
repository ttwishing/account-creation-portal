import { customAlphabet } from 'nanoid'

export const randomCode = customAlphabet(
    '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
    22
)

export const urlParams = (params: Record<string, string>) =>
    new URLSearchParams(params).toString()
