import api from './api'
import apiv2 from './apiv2'

export interface Product {
  id: number
  name: string
  sku: string
  unit: string
  description: string
  image: File | string
  addon: AddonsProps[]
  add_on_link?: AddonsProps[]
  price: string
  barcode?: string | null
  category: {
    id: string | null
    name: string | null
  }
  variant?: VariantItem[]
  variant_item?: VariantItem[]
  is_active?: boolean
  updated_at?: string
  children?: Product[]
  hasVariant?: boolean
  hasAddon?: boolean
  asAddon?: boolean
  variant_change?: boolean
  variant_clear?: boolean
}

export interface VariantItem {
  id: number
  name: string
  sku: string
  product_item_id?: string
  is_active: boolean
  updated_at: string
}

export interface TotalData {
  count_all: number
  count_active: number
  count_non_active: number
}

export interface QueryParamsProps {
  page: number
  per_page: string
  keyword: string
  tab: string
}

export interface CategoriesProps {
  id: number
  name: string
}

export interface AddonsProps {
  id: number
  name: string
  is_active: boolean | number
  add_on_item_count: number
}

export const productService = {
  async getAll(query: QueryParamsProps) {
    const tabHandle = query.tab == 'aktif' ? '1' : query.tab == 'non_aktif' ? '0' : null
    const res = await apiv2.post<{
      data: { data: Product[] }
      count_all: number
      count_active: number
      count_non_active: number
    }>('/list', {
      page: query.page,
      search: query.keyword,
      page_count: query.per_page,
      active: tabHandle,
    })
    return {
      data: res.data,
      count_all: res.data.count_all,
      count_active: res.data.count_active,
      count_non_active: res.data.count_non_active,
    }
  },
  async getCategories() {
    const res = await api.post<{ data: CategoriesProps[] }>(`/category`)
    return res.data.data
  },
  async getAddons() {
    const res = await apiv2.post<{ data: AddonsProps[] }>(`/addonlist`)
    return res.data.data
  },

  async getById(id: number) {
    const res = await apiv2.post<{ data: Product }>(
      `/detail`,
      { id_barang: id },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return res.data.data
  },

  async create(data: Omit<Product, 'id' | 'updated_at'>) {
    const formData = new FormData()

    formData.append(
      'data_barang',
      JSON.stringify({
        nama_barang: data.name,
        kategori: data.category.name,
        sku: data.sku,
        unit: data.unit,
        harga: data.price,
        barcode: data.barcode || null,
        deskripsi: data.description,
        has_variant: data.hasVariant ?? false,
        has_addon: data.addon.length !== 0,
        as_addon: data.asAddon ?? false,
        add_on: data.addon,
      })
    )

    // if (data.image) {
    //   formData.append('gambar', data.image)
    // }

    const res = await apiv2.post<Product>('/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data
  },

  async update(data: Omit<Product, 'updated_at'>) {
    const formData = new FormData()

    formData.append(
      'data_barang',
      JSON.stringify({
        id: data.id,
        nama_barang: data.name,
        kategori: data.category.id,

        sku: data.sku,
        unit: data.unit,
        harga: data.price,
        barcode: data.barcode || null,
        deskripsi: data.description,
        has_variant: data.hasVariant ?? false,
        has_addon: data.addon.length !== 0,
        as_addon: data.asAddon ?? false,
        add_on: data.addon,
        variant_change: false,
        variant_clear: false,
      })
    )

    // if (data.image) {
    //   formData.append('gambar', data.image)
    // }

    const res = await apiv2.post<Product>('/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data
  },
  async updateStatus(product: Partial<Product>) {
    const res = await apiv2.post<Product>(`/changeitemstatus`, {
      status: product.is_active ? 'ON' : 'OFF',
      id_barang: product.id,
    })
    return res.data
  },

  async updateStatusBulk(id: string, is_active: boolean) {
    const res = await apiv2.post<Product>(`/changeitemstatus`, {
      status: is_active ? 'ON' : 'OFF',
      id_barang: id,
    })
    return res.data
  },

  async delete(id: number) {
    await apiv2.post(`/delete`, { item: id })
    return true
  },
}
