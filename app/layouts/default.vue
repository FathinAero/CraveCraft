<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Scans', to: '/scans' },
]
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900">
    <UDashboardGroup>
      <UDashboardSidebar
        class="border-r border-gray-200 bg-white"
        collapsible
        resizable
      >
        <template #header="{ collapsed }">
          <div class="h-16 flex items-center px-4 border-b border-gray-200 w-full">
            <span
              class="font-semibold tracking-tight"
              :class="collapsed ? 'sr-only' : ''"
            >
              CraveCraft
            </span>
          </div>
        </template>

        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            :class="
              route.path === link.to
                ? 'bg-emerald-50 text-emerald-600 font-medium' // Active state (light)
                : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100' // Inactive state (light)
            "
          >
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </UDashboardSidebar>

      <UDashboardPanel class="bg-white">
        <template #header>
          <UDashboardNavbar
            title="Dashboard Analisis Konsumsi"
            class="border-b border-gray-200 bg-white/80 backdrop-blur"
          />
        </template>

        <template #body>
          <main class="p-4 md:p-6">
            <slot />
          </main>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>