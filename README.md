# Story Handicraft Backend

این سرویس یک API سبک برای پروژه اصلی است که بدون Supabase کار می‌کند. داده‌ها از فایل JSON محلی خوانده می‌شوند و از طریق HTTP در دسترس قرار می‌گیرند.

## اجرای محلی
```bash
# در ریشه story-handicraft-backend
npm install   # وابستگی خارجی ندارد ولی برای قفل نسخه نصب کنید
npm run start # پیش‌فرض روی پورت 4000
```
در صورت نیاز پورت را با `PORT=5000 npm run start` عوض کنید.

## دیپلوی روی لیارا (سرویس جداگانه)
1) این پوشه را جداگانه دیپلوی کنید (مثلاً ریپو story-handicraft-backend).
2) فایل `liara.json` پورت 4000 را تنظیم کرده است؛ به تنظیم اضافه‌ای نیاز نیست.
3) پس از دیپلوی، آدرس را یادداشت کنید (مثلاً `https://story-handicraft-api.liara.run`).
- `GET /images/<filename>` – serve static images (jpg/png/webp)
4) در سرویس فرانت، متغیر `NEXT_PUBLIC_API_BASE_URL` را برابر همین آدرس بگذارید و فرانت را ری‌استارت کنید.

## مسیرها
- `GET /health` — بررسی وضعیت
- `GET /products` — لیست محصولات؛ پارامترهای اختیاری `q` برای جست‌وجو و `ids` (لیست جداشده با کاما) برای فیلتر
## Product Images

- Place image files in `src/public/images/`.
- By default, each product will use `/images/<id>.jpg` if no `image_url` is provided in the JSON.
- You may override per item by adding `image_url` in `src/data/products.json`.

## Liara Deployment Notes

- The server listens on `process.env.PORT` or `3000` to match `liara.json`.
- Ensure your Liara app has the correct `PORT` configured (default is fine) and that you deploy with the `src/public/images` folder included.
- No external DB is required; `db.js` and `models/` are unused in this JSON-only mode.

- `GET /products/:id` — جزئیات یک محصول
- `GET /product-ids` — فقط شناسه‌ها برای استفاده در سایت‌مپ
