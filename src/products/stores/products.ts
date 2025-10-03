import type { DataTableRowKey } from 'naive-ui'
import { defineStore } from 'pinia'
import {
  productService,
  type AddonsProps,
  type CategoriesProps,
} from '../../services/productService'

export interface DropdownOption {
  label: string
  value: string | number
  is_active?: boolean | number
  add_on_item_count?: number
}

export const useProductStore = defineStore('product', {
  state: () => ({
    checkedId: [] as DataTableRowKey[],
    categories: [] as DropdownOption[],
    addons: [] as DropdownOption[],
  }),

  getters: {
    getAddons: state => state.addons,
    getCategories: state => state.categories,
    getCheckedData: state => state.checkedId,
    getCountChecked: state => state.checkedId.length,
  },

  actions: {
    async fetchCategories() {
      if (this.categories.length > 0) return this.categories

      const data = await productService.getCategories()

      this.setCategories(data)

      return this.categories
    },
    async fetchAddons() {
      if (this.addons.length > 0) return this.addons

      const data = await productService.getAddons()
      this.setAddons(data)

      return this.addons
    },

    setCategories(data: CategoriesProps[]) {
      this.categories = data.map(res => ({
        label: res.name,
        value: res.id,
      }))
    },
    setAddons(data: AddonsProps[]) {
      this.addons = data.map(res => ({
        label: res.name,
        value: res.id,
        is_active: res.is_active === 1 ? true : false,
        add_on_item_count: res.add_on_item_count,
      }))
    },

    setChecked(ids: DataTableRowKey[]) {
      this.checkedId = ids
    },

    clearChecked() {
      this.checkedId = []
      console.log('clear', this.checkedId)
    },
  },
})
