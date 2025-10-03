<script lang="ts" setup>
import { ArrowLeftIcon, BellIcon } from '@heroicons/vue/24/outline'
import { NAvatar } from 'naive-ui'
import FormData from './components/form.vue'
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div class="flex justify-between items-center gap-4">
        <router-link to="/"><ArrowLeftIcon class="w-6" /></router-link>
        <p class="text-2xl text-gray-600 font-bold">Tambah Barang Baru</p>
      </div>
      <div class="flex gap-4 items-center">
        <div class="p-2 border border-gray-400 rounded-full">
          <BellIcon class="w-6 text-blue-900" />
        </div>
        <div class="flex items-center gap-4">
          <n-avatar round src="/profile-thumnail.webp" :size="38" />
          <p class="text-xl font-semibold text-blue-900">Rehan Ardian</p>
        </div>
      </div>
    </div>
    <FormData />
  </div>
</template>
