<script setup lang="ts">
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import { NDataTable, NSwitch } from 'naive-ui'
import { h, ref, type PropType } from 'vue'
import type { Product } from '../../services/productService'
import dayjs from 'dayjs'
import { formatPrice } from '../../utils/format'
import { useProductStore } from '../stores/products'

const props = defineProps({
  data: {
    type: Array as PropType<Product[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'onUpdateStatus', product: Partial<Product>): void
}>()

function createColumns({
  toggle,
}: {
  toggle: (row: Product, value: boolean) => void
}): DataTableColumns<Product> {
  return [
    {
      type: 'selection',
      disabled(row: Product) {
        const parent = props.data.find(p => p.children?.some(c => c.id === row.id))
        return !!parent
      },
    },
    {
      title: 'Nama Barang',
      key: 'name',
      render(row) {
        return h('div', {}, [
          h(
            'a',
            { class: 'text-lg font-bold text-blue-800', href: `/product/edit/${row.id}` },
            row.name
          ),
          h('p', { class: 'text-sm text-gray-700' }, row.description),
        ])
      },
    },
    {
      title: 'Harga',
      key: 'price',
      render(row) {
        return h('span', formatPrice(row.price))
      },
    },
    {
      title: 'Kategori',
      key: 'category',
      render(row) {
        return h('span', row.category.name || '')
      },
    },
    {
      title: 'Tanggal Diperbaharui',
      key: 'updated_at',
      render(row) {
        return h('span', dayjs(row.updated_at).format('DD/MM/YYYY HH:mm'))
      },
    },
    {
      title: 'Tindakan',
      key: 'actions',
      render(row) {
        const parent = props.data.find(p => p.children?.some(c => c.id === row.id))
        if (parent) return null

        return h(NSwitch, {
          size: 'small',
          value: row.is_active,
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': (val: boolean) => toggle(row, val),
        })
      },
    },
  ]
}

const columns = createColumns({
  toggle(row: Product, value: boolean) {
    const index = props.data.findIndex(p => p.id === row.id)
    if (index !== -1) {
      props.data[index]!.is_active = value
      emit('onUpdateStatus', { id: row.id, is_active: value })
    }
  },
})

const pagination = false as const

const checkedData = ref<DataTableRowKey[]>([])

function rowKey(row: Product) {
  return row.id
}

const store = useProductStore()
function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedData.value = rowKeys
  store.setChecked(rowKeys)
}

function resetChecked() {
  checkedData.value = []
}
defineExpose({ resetChecked })
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :bordered="false"
    :row-key="rowKey"
    :checked-row-keys="checkedData"
    @update:checked-row-keys="handleCheck"
    default-expand-all
    :loading="isLoading"
  />
</template>
