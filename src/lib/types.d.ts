export interface Product {
    id: string
    name: string
    image: string
    chain: string
    key: string
}

export interface Ticket {
    name: string
    productId: string
    premium: string
    description: string
    chainId: string
}
