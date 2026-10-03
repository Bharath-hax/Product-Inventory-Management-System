# Task 01 API Reference

Base URL: `http://localhost:8001/api`

## Products
- `GET /products?page=1&limit=8&search=keyboard&category=Electronics&status=active`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `POST /products/:id/stock` body: `{ "type": "in", "quantity": 5, "note": "Purchase order" }`
- `GET /products/:id/movements`
- `GET /dashboard/inventory`

All validation errors use HTTP 400. Missing resources use 404. Duplicate SKUs use 409. Stock-out requests that would make inventory negative use 409.
