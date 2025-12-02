import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '../data/products.json')
let cachedProducts = null

function normalizeProduct(raw) {
  return {
    id: Number(raw.id),
    name: raw.name || 'محصول بدون نام',
    price: Number(raw.price || 0),
    description: raw.description || '',
    image_url: raw.image_url || raw.image || '',
    model: raw.model || raw.category || 'محصول',
    size: raw.size || '',
    stok: typeof raw.stok === 'number' ? raw.stok : (raw.stock ?? 0)
  }
}

export async function loadProducts() {
  if (cachedProducts) return cachedProducts
  const raw = await readFile(dataPath, 'utf8')
  const parsed = JSON.parse(raw)
  cachedProducts = parsed.map(normalizeProduct)
  return cachedProducts
}

export async function findProductById(id) {
  const products = await loadProducts()
  return products.find((p) => p.id === Number(id)) || null
}

export async function searchProducts({ query, ids } = {}) {
  const products = await loadProducts()
  let result = products

  if (Array.isArray(ids) && ids.length > 0) {
    const numericIds = ids.map((v) => Number(v)).filter((v) => !Number.isNaN(v))
    result = result.filter((p) => numericIds.includes(p.id))
  }

  if (query) {
    const q = query.trim().toLowerCase()
    if (q.length > 0) {
      result = result.filter((p) =>
        [p.name, p.model, p.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q))
      )
    }
  }

  return result.sort((a, b) => a.id - b.id)
}

export async function listProductIds() {
  const products = await loadProducts()
  return products.map((p) => p.id)
}
