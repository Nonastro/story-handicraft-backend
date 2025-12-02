import http from 'http'
import { URL } from 'url'
import { connectDB } from './db.js'
import { Product } from './models/Product.js'

const PORT = process.env.PORT || 4000

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

const server = http.createServer(async (req, res) => {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' })
  }

  if (req.method === 'GET' && url.pathname === '/products') {
    try {
      const query = url.searchParams.get('q') || ''
      const idsParam = url.searchParams.get('ids')
      const ids = idsParam ? idsParam.split(',') : []

      const filter = {}

      if (query) {
        filter.name = { $regex: query, $options: "i" }
      }

      if (ids.length > 0) {
        filter.id = { $in: ids.map(Number) }
      }

      const products = await Product.find(filter)
      return sendJson(res, 200, { items: products })
    } catch (error) {
      console.error('Failed to list products', error)
      return sendJson(res, 500, { message: 'خطا در دریافت محصولات' })
    }
  }

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

  if (req.method === 'GET' && url.pathname === '/product-ids') {
    try {
      const ids = await Product.find({}, { id: 1, _id: 0 })
      return sendJson(res, 200, { ids: ids.map(i => i.id) })
    } catch (error) {
      console.error('Failed to list ids', error)
      return sendJson(res, 500, { message: 'خطا در دریافت شناسه‌ها' })
    }
  }

  res.statusCode = 404
  res.end('Not Found')
})

connectDB();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`)
})
