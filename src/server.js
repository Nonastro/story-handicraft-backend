import http from 'http'
import { URL } from 'url'
import { connectDB } from './db.js'
import { Product } from './models/Product.js'

const PORT = process.env.PORT || 4000

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
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

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

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

      const filter = {}

      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { design: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } }
        ]
      }

      if (ids.length > 0) {
        filter.id = { $in: ids.map(Number) }
      }

      const products = await Product.find(filter).sort({ id: 1 })
      return sendJson(res, 200, { items: products })
    } catch (error) {
      console.error('Failed to list products', error)
      return sendJson(res, 500, { message: 'خطا در دریافت محصولات' })
    }
  }

  // GET /products/:id - Get a single product by ID
  const productMatch = url.pathname.match(/^\/products\/(\d+)$/)
  if (req.method === 'GET' && productMatch) {
    try {
      const id = Number(productMatch[1])
      const product = await Product.findOne({ id })
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
      const products = await Product.find({}, { id: 1, _id: 0 }).sort({ id: 1 })
      return sendJson(res, 200, { ids: products.map(p => p.id) })
    } catch (error) {
      console.error('Failed to list ids', error)
      return sendJson(res, 500, { message: 'خطا در دریافت شناسه‌ها' })
    }
  }

  // POST /admin/products - Create a new product
  if (req.method === 'POST' && url.pathname === '/admin/products') {
    try {
      const body = await parseBody(req)

      // Validate required fields
      if (!body.name || !body.design || !body.model) {
        return sendJson(res, 400, {
          message: 'فیلدهای name، design و model الزامی هستند'
        })
      }

      // Get the highest ID and increment by 1
      const lastProduct = await Product.findOne().sort({ id: -1 }).limit(1)
      const newId = lastProduct ? lastProduct.id + 1 : 1

      // Create new product
      const newProduct = new Product({
        id: newId,
        name: body.name,
        design: body.design,
        model: body.model,
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        price: body.price || null
      })

      await newProduct.save()

      return sendJson(res, 201, {
        message: 'محصول با موفقیت ایجاد شد',
        product: newProduct
      })
    } catch (error) {
      console.error('Failed to create product', error)

      if (error.message === 'Invalid JSON') {
        return sendJson(res, 400, { message: 'فرمت JSON نامعتبر است' })
      }

      return sendJson(res, 500, { message: 'خطا در ایجاد محصول' })
    }
  }

  // 404 for all other routes
  res.statusCode = 404
  res.end('Not Found')
})

// Connect to database before starting server
connectDB()

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`)
})
