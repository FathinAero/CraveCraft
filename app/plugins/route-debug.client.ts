export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    // biar keliatan sebelum pindah
    console.log('[beforeEach]', from.fullPath, '->', to.fullPath)
  })

  router.afterEach((to, from) => {
    console.log('[afterEach]', from.fullPath, '->', to.fullPath)
  })
})
