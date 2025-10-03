<script setup lang="ts">
import { PlusIcon, TrashIcon } from '@heroicons/vue/16/solid'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NRow,
  NCol,
  NButton,
  NDivider,
  NUpload,
  NSelect,
  NSwitch,
  NTable,
} from 'naive-ui'

import type { FormInst, FormRules, FormValidationError } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/products'
import { productService, type Product } from '../../services/productService'

const formRef = ref<FormInst | null>(null)

const modelRef = ref<Product>({
  id: 0,
  name: '',
  sku: '',
  description: '',
  image: '',
  price: '',
  category: {
    id: null,
    name: null,
  },
  unit: '',
  addon: [],
})

const previewUrl = ref<string>('/thumbnail.svg')

const route = useRoute()
const routerId = Number(route.params.id)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) return

  const detail = await productService.getById(id)
  if (detail) {
    modelRef.value = {
      ...detail,
      price: String(detail.price),
      category: {
        id: detail.category?.id ?? null,
        name: detail.category?.name ?? null,
      },
      addon: (detail.add_on_link ?? []).map((group: any) => ({
        id: group.add_on_group.id,
        name: group.add_on_group.name,
        is_active: group.add_on_group.is_active == 1 ? true : false,
        add_on_item_count: group.add_on_group.add_on_item_count ?? 0,
      })),
    }

    if (detail.image && typeof detail.image === 'string') {
      previewUrl.value = 'https://api.sandbox.kasheer.id/storage/' + detail.image
    }
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: 'Nama Barang wajib diisi', trigger: ['input', 'blur'] },
    {
      min: 3,
      max: 50,
      message: 'Nama Barang harus antara 3 sampai 50 karakter',
      trigger: ['input', 'blur'],
    },
  ],
  'category.name': [
    { required: false, message: 'Kategori Barang wajib dipilih', trigger: ['change', 'blur'] },
  ],
  price: [
    { required: true, message: 'Harga wajib diisi', trigger: ['input', 'blur'] },
    {
      validator(rule, value: string) {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return new Error('Harga harus berupa angka positif')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
  sku: [
    {
      min: 3,
      max: 20,
      message: 'Kode Barang minimal 3 dan maksimal 20 karakter',
      trigger: ['input', 'blur'],
    },
  ],
  unit: [{ max: 10, message: 'Unit Barang maksimal 10 karakter', trigger: ['input', 'blur'] }],
  addon: [
    {
      validator(rule, value) {
        if (value && value.length > 5) {
          return new Error('Add On maksimal 5 item')
        }
        return true
      },
      trigger: 'change',
    },
  ],
}

function handleValidateButtonClick(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
    if (!errors) {
      if (Number(route.params.id)) {
        productService.update(modelRef.value)
      } else {
        productService.create(modelRef.value)
      }
      console.log('✅ Valid', modelRef.value)
    } else {
      console.log(errors)
    }
  })
}

const store = useProductStore()
const options = computed(() => store.getCategories)
const optionsAddons = computed(() => store.getAddons)

onMounted(async () => {
  await store.fetchCategories()
  await store.fetchAddons()

  await fetchDetail()
})

const newAddon = ref<string | null>(null)

function addAddon() {
  if (!newAddon.value) return
  const addon = store.getAddons.find(a => a.value === newAddon.value)

  if (addon && !modelRef.value.addon.find(a => a.id === addon.value)) {
    modelRef.value.addon.push({
      id: Number(addon.value),
      name: addon.label,
      is_active: addon.is_active ?? false,
      add_on_item_count: addon.add_on_item_count ?? 0,
    })
  }
  newAddon.value = null
}

function removeAddon(name: string) {
  modelRef.value.addon = modelRef.value.addon.filter(a => a.name !== name)
}

function handleUploadChange(options: { file: any; fileList: any[] }) {
  const file = options.file.file as File
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
    modelRef.value.image = file
  }
}

function handleRemove() {
  previewUrl.value = '/thumbnail.svg'
  modelRef.value.image = ''
}

async function handleDelete() {
  if (!routerId) return

  try {
    await productService.delete(routerId)
    console.log('🗑️ Barang berhasil dihapus')

    window.location.href = '/'
  } catch (error) {
    console.error('❌ Gagal menghapus barang:', error)
  }
}
</script>

<template>
  <n-form ref="formRef" :model="modelRef" :rules="rules" class="flex flex-col gap-8">
    <n-card>
      <p class="text-lg font-bold text-gray-800 mb-4">Info Barang</p>
      <n-form-item path="name" label="Nama Barang">
        <n-input v-model:value="modelRef.name" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item path="description">
        <template #label> Deskripsi Barang <span class="text-gray-400">(optional)</span></template>
        <n-input
          v-model:value="modelRef.description"
          type="textarea"
          placeholder="Basic Textarea"
        />
      </n-form-item>

      <n-divider />

      <p class="text-lg font-bold text-gray-800 mb-4">Organisasi Barang</p>
      <n-form-item path="category" label="Kategori Barang">
        <n-select v-model:value="modelRef.category.name" :options="options" />
      </n-form-item>

      <n-divider />

      <n-form-item path="image" label="Foto Barang">
        <div class="flex items-end justify-between w-full border border-gray-200 rounded p-4">
          <div class="flex gap-8">
            <img :src="previewUrl" class="w-24 h-24 object-cover rounded-lg" />
            <div>
              <p class="mb-1 font-bold">Unggah foto</p>
              <span class="text-xs text-gray-400">Format .png & .jpg up to 10MB</span>
            </div>
          </div>
          <div>
            <n-upload
              :max="1"
              :default-upload="false"
              @change="handleUploadChange"
              @remove="handleRemove"
            >
              <n-button
                size="small"
                class="bg-blue-900 text-white hover:bg-blue-800 rounded cursor-pointer transition-colors"
              >
                Unggah Foto
              </n-button>
            </n-upload>
          </div>
        </div>
      </n-form-item>
    </n-card>

    <n-card>
      <p class="text-lg font-bold text-gray-800 mb-4">Harga</p>
      <n-form-item path="price" label="Harga">
        <n-input v-model:value="modelRef.price" placeholder="Rp. 0" @keydown.enter.prevent />
      </n-form-item>
    </n-card>

    <n-card>
      <div>
        <p class="text-lg font-bold text-gray-800">Detail Barang</p>
        <span class="text-gray-600">Pilih tipe barang yang sesuai dengan barang Anda</span>
      </div>
      <n-divider />
      <div class="grid grid-cols-2 gap-4">
        <n-form-item path="sku" label="Kode Barang (SKU)">
          <n-input
            v-model:value="modelRef.sku"
            placeholder="Contoh: AG001"
            @keydown.enter.prevent
          />
        </n-form-item>
        <n-form-item path="unit" label="Unit Barang">
          <n-input
            v-model:value="modelRef.unit"
            placeholder="Contoh: kg, pcs, unit"
            @keydown.enter.prevent
          />
        </n-form-item>
      </div>
    </n-card>

    <n-card>
      <div class="flex justify-between items-start">
        <div>
          <p class="text-lg font-bold text-gray-800">Add On</p>
          <span class="text-gray-600">Tambahkan Add On pada barang Anda</span>
        </div>
        <p class="text-gray-600">Limit Penambahan Add On ({{ modelRef.addon.length }}/5)</p>
      </div>
      <n-divider />
      <div class="flex gap-4 items-center">
        <n-form-item path="addon" label="Pilih Add On" class="w-full">
          <n-select v-model:value="newAddon" :options="optionsAddons" placeholder="Pilih Add On" />
        </n-form-item>
        <n-button
          class="bg-blue-900 text-white hover:bg-blue-800 rounded px-4 py-2 cursor-pointer transition-colors"
          @click="addAddon"
        >
          <PlusIcon class="w-4" /> Tambah Barang
        </n-button>
      </div>

      <div v-if="modelRef.addon.length > 0" class="mt-6">
        <n-table :bordered="true" :single-line="true">
          <thead>
            <tr>
              <th class="w-full">Add On</th>
              <th class="w-1/4">Status</th>
              <th class="w-1/4">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in modelRef.addon" :key="idx">
              <td>
                <div class="flex space-x-4 items-center">
                  <p class="text-blue-900 font-bold">{{ item.name }}</p>
                  <p
                    :class="`rounded-lg px-2 py-1 ${
                      item.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`"
                  >
                    {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </p>
                </div>
                <p class="text-sm text-gray-400">{{ item.add_on_item_count }} Pilihan</p>
              </td>
              <td>
                <n-switch v-model:value="item.is_active" />
              </td>
              <td>
                <n-button type="error" quaternary @click="removeAddon(item.name)">
                  <TrashIcon class="w-4 h-4" />
                </n-button>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </n-card>

    <n-row :gutter="[0, 24]">
      <n-col :span="12" v-if="routerId">
        <n-button type="error" @click="handleDelete"
          ><TrashIcon class="w-4 h-4" /> Hapus Barang</n-button
        >
      </n-col>
      <n-col :span="routerId ? 12 : 24">
        <div class="flex items-center justify-end gap-4">
          <router-link to="/">
            <n-button attr-type="button">Batal</n-button>
          </router-link>
          <n-button type="info" @click="handleValidateButtonClick">Simpan</n-button>
        </div>
      </n-col>
    </n-row>
  </n-form>
</template>
