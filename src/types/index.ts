/**
 * 商品資料結構格式
 */
export interface IProduct {
  clothingGender: 'male' | 'female'
  clothingPart: 'shirts' | 'pants'
  colors: string[]
  createdAt: string
  description: string
  discountRate: number
  images: string[]
  name: string
  price: number
  ratings: { _id: string; score: number }[]
  sell: boolean
  sizes: string[]
  soldQuantity: number
  stockQuantity: number
  tags: string[]
  updatedAt: string
  _id: string
}

/**
 * 穿搭資料結構格式
 */
export interface IOutfit {
  _id: string
  outfitName: string
  description: string
  clerk: {
    avatar: string
    height: number
    weight: number
    sex: string
    _id: string
    name: string
  }
  images: string[]
  products: {
    product: string
    color: string
    size: string
    _id: string
  }
  show: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 評分資料結構格式
 */
export interface IRating {
  _id: string
  user: {
    _id: string
    name: string
    avatar: string
  }
  product: string
  score: number
  description: string
  thumb: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}
