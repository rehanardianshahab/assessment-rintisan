<script setup lang="ts">
import { NTabs, NTabPane, NCard, NSelect, NInput, NPagination } from 'naive-ui'
import Table from './components/table.vue'
import { computed, onMounted, ref, watch } from 'vue'
import {
  productService,
  type Product,
  type QueryParamsProps,
  type TotalData,
} from '../services/productService'
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'
import { useProductStore } from './stores/products'

const store = useProductStore()
const dataChecked = computed(() => store.getCheckedData)
const dataCheckedCount = computed(() => store.getCountChecked)

const router = useRouter()
const query = ref<QueryParamsProps>({
  page: 1,
  per_page: '5',
  keyword: '',
  tab: 'semua' as const,
})

const dataTable = ref<Product[]>([])
const totalData = ref<TotalData>()
const isLoading = ref(false)
const tableRef = ref<InstanceType<typeof Table> | null>(null)

const options = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '25', value: '25' },
  { label: '50', value: '50' },
]

const clearCheckedData = () => {
  store.clearChecked()
  tableRef.value?.resetChecked()
}

const fetchData = async () => {
  try {
    isLoading.value = true
    const res = await productService.getAll(query.value)
    const { data, count_all, count_active, count_non_active } = res.data
    dataTable.value = data.data
    totalData.value = {
      count_all,
      count_active,
      count_non_active,
    }
  } finally {
    isLoading.value = false
    clearCheckedData()
  }
}

const fetchWithDebounce = debounce(fetchData, 500)

onMounted(fetchData)

watch(() => query.value.page, fetchData)
watch(() => query.value.tab, fetchData)
watch(() => query.value.per_page, fetchData)
watch(() => query.value.keyword, fetchWithDebounce)

const handleUpdateStatus = async (product: Partial<Product>) => {
  await productService.updateStatus(product)
  fetchData()
}

const handleUpdateStatusBulk = async (is_active: boolean) => {
  const id = dataChecked.value.join('|')
  await productService.updateStatusBulk(id, is_active)
  fetchData()
}

const goToCreate = () => {
  router.push('/product/new')
}
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <n-button
        @click="goToCreate"
        class="bg-blue-900 text-white hover:bg-blue-800 rounded px-4 py-2 cursor-pointer transition-colors"
        >+ Tambah Barang</n-button
      >
    </div>
    <n-card>
      <div class="grid lg:grid-cols-12 justify-between items-center">
        <div class="lg:col-span-6">
          <n-tabs
            v-if="dataCheckedCount == 0"
            class="rounded"
            tab-class="bg-transparent text-red-400 m-2"
            v-model:value="query.tab"
            type="segment"
            animated
          >
            <n-tab-pane class="rounded" name="semua">
              <template #tab>
                <div class="flex gap-2">
                  <p>Semua Barang</p>
                  <p class="border rounded border-gray-600 text-gray-600 px-2">
                    {{ totalData?.count_all }}
                  </p>
                </div>
              </template>
            </n-tab-pane>
            <n-tab-pane class="rounded" name="aktif">
              <template #tab>
                <div class="flex gap-2">
                  <p>Aktif</p>
                  <p class="border rounded border-gray-600 text-gray-600 px-2">
                    {{ totalData?.count_active }}
                  </p>
                </div>
              </template>
            </n-tab-pane>
            <n-tab-pane class="rounded" name="non_aktif">
              <template #tab>
                <div class="flex gap-2">
                  <p>Non Aktif</p>
                  <p class="border rounded border-gray-600 text-gray-600 px-2">
                    {{ totalData?.count_non_active }}
                  </p>
                </div>
              </template>
            </n-tab-pane>
          </n-tabs>
          <div v-else>
            <div class="flex space-x-6">
              <p>{{ dataCheckedCount }} Produk Terpilih</p>
              <n-button
                @click="handleUpdateStatusBulk(false)"
                class="text-blue-600 hover:text-blue-800 cursor-pointer font-bold underline"
                >Non aktifkan</n-button
              >
              <n-button
                @click="handleUpdateStatusBulk(true)"
                class="text-blue-600 hover:text-blue-800 cursor-pointer font-bold underline"
                >Aktifkan</n-button
              >
            </div>
          </div>
        </div>
        <div class="lg:col-span-3 lg:col-start-10">
          <div class="flex pb-3 gap-4">
            <n-select v-model:value="query.per_page" :options="options" />
            <n-input class="w-full" v-model:value="query.keyword" placeholder="Cari barang..." />
          </div>
        </div>
      </div>

      <Table
        ref="tableRef"
        :data="dataTable"
        :isLoading="isLoading"
        @onUpdateStatus="handleUpdateStatus"
      />

      <div class="flex justify-center mt-4">
        <n-pagination
          v-model:page="query.page"
          :page-size="Number(query.per_page)"
          :item-count="
            query.tab == 'aktif'
              ? totalData?.count_active
              : query.tab == 'non_aktif'
              ? totalData?.count_non_active
              : totalData?.count_all
          "
        />
      </div>
    </n-card>
  </div>
</template>
