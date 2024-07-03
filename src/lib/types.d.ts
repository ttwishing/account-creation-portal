export interface Product {
    id: string
    name: string
    image: string
    chain: string
    key: string
}

export interface Price {
    id: string
    unit_amount: number
    currency: string
}

export interface StripeProduct {
    product: Product
    price: Price
    key: string
}

export interface Ticket {
    name: string
    productId: string
    premium: string
    description: string
    chainId: string
}
