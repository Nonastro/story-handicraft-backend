import http from 'http'
import { URL } from 'url'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadProducts, searchProducts, findProductById, listProductIds } from './lib/products.js'

const PORT = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, 'public')

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

// No request body parsing needed for GET-only API

const server = http.createServer(async (req, res) => {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  // Health check endpoint
  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' })
  }

  // GET /products - List all products with optional filtering
  if (req.method === 'GET' && url.pathname === '/products') {
    try {
      const query = url.searchParams.get('q') || ''
      const idsParam = url.searchParams.get('ids')
      const ids = idsParam ? idsParam.split(',') : []

      const items = await searchProducts({ query, ids })
      return sendJson(res, 200, { items })
    } catch (error) {
      console.error('Failed to list products', error)
      return sendJson(res, 500, { message: 'خطا در دریافت محصولات' })
    }
  }

  // Serve static images: GET /images/<filename>
  if (req.method === 'GET' && url.pathname.startsWith('/images/')) {
    try {
      const relPath = url.pathname.replace('/images/', '')
      const safeRel = relPath.replace(/\\/g, '/').replace(/\.+/g, '.')
      const imgPath = path.join(publicDir, 'images', safeRel)
      if (!fs.existsSync(imgPath) || !fs.statSync(imgPath).isFile()) {
        res.statusCode = 404
        return res.end('Not Found')
      }
      const ext = path.extname(imgPath).toLowerCase()
      const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      const stream = fs.createReadStream(imgPath)
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000' })
      return stream.pipe(res)
    } catch (error) {
      console.error('Failed to serve image', error)
      res.statusCode = 500
      return res.end('Internal Server Error')
    }
  }

  // GET /products/:id - Get a single product by ID
  const productMatch = url.pathname.match(/^\/products\/(\d+)$/)
  if (req.method === 'GET' && productMatch) {
    try {
      const id = Number(productMatch[1])
      const product = await findProductById(id)
      if (!product) {
        return sendJson(res, 404, { message: 'محصول پیدا نشد' })
      }
      return sendJson(res, 200, product)
    } catch (error) {
      console.error('Failed to read product', error)
      return sendJson(res, 500, { message: 'خطا در دریافت محصول' })
    }
  }

  // GET /product-ids - Get list of all product IDs
  if (req.method === 'GET' && url.pathname === '/product-ids') {
    try {
      const ids = await listProductIds()
      return sendJson(res, 200, { ids })
    } catch (error) {
      console.error('Failed to list ids', error)
      return sendJson(res, 500, { message: 'خطا در دریافت شناسه‌ها' })
    }
  }

  // Admin write routes removed: backend is read-only from JSON

  // Admin reset route removed: no MongoDB, only JSON file

  // 404 for all other routes
  res.statusCode = 404
  res.end('Not Found')
})

// No database connection necessary; using JSON file only

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`)
})
