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
    avatar: string | undefined
    height: number | undefined
    weight: number | undefined
    sex: string
    _id: string
    name: string | undefined
    store: {
      _id: string
      name: string
    }
    introduce: string | undefined
  }
  images: string[]
  products: {
    product: IProduct[]
    color: string
    size: string
    _id: string
  }[]
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

/**
 * 最新消息資料結構格式
 */
export interface INews {
  _id: string
  title: string
  content: string
  image?: string
  show: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 分類資料結構格式
 */
export interface ICategory {
  _id: string
  categoryType: string
  gender: string
  key: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * 店鋪資料結構格式
 */
export interface IStore {
  _id: string
  name: string
  phone: string
  address: string
  position: string
  googleMapAddress: string
  openingTime: string
  sellSeries: {
    _id: string
    key: string
    name: string
    gender: string
    categoryType: string
    updatedAt: string
    createdAt: string
  }[]
  updatedAt: string
  createdAt: string
}

/**
 * 購物車資料結構格式
 */
export interface ICart {
  _id: string
  product: IProduct
  color: string
  quantity: number
  size: string
}

/**
 * 品牌資料結構格式
 */
export interface IBrand {
  _id: string
  name: string
  deliveryFee: number
  freeDeliveryFee: number
  updatedAt: string
  createdAt: string
}
