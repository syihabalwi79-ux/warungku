require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;


// ==============================
// KONEKSI DATABASE
// ==============================

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


// ==============================
// CEK KONEKSI DATABASE
// ==============================

pool.query("SELECT NOW()", (error, result) => {
    if (error) {
        console.error("Database gagal terhubung:", error.message);
    } else {
        console.log("Database berhasil terhubung!");
        console.log("Waktu database:", result.rows[0].now);
    }
});


// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


// ==============================
// GET SEMUA PRODUK
// ==============================

app.get("/api/products", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                products.id,
                products.nama,
                products.price,
                products.stock,
                products.category_id,
                categories.nama AS category_name,
                products.created_at

            FROM products

            LEFT JOIN categories
                ON products.category_id = categories.id

            ORDER BY products.id ASC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Gagal mengambil produk:",
            error.message
        );

        res.status(500).json({
            error: "Gagal mengambil data produk"
        });
    }
});


// ==============================
// POST TAMBAH PRODUK
// ==============================

app.post("/api/products", async (req, res) => {
    try {

        const {
            name,
            price,
            stock,
            category_id
        } = req.body;


        const result = await pool.query(
            `
            INSERT INTO products
                (nama, price, stock, category_id)

            VALUES
                ($1, $2, $3, $4)

            RETURNING *
            `,
            [
                name,
                price,
                stock,
                category_id
            ]
        );


        res.status(201).json(
            result.rows[0]
        );

    } catch (error) {

        console.error(
            "Gagal menambahkan produk:",
            error.message
        );

        res.status(500).json({
            error: "Gagal menambahkan produk"
        });
    }
});


// ==============================
// PUT EDIT PRODUK
// ==============================

app.put("/api/products/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const {
            name,
            price,
            stock,
            category_id
        } = req.body;


        const result = await pool.query(
            `
            UPDATE products

            SET
                nama = $1,
                price = $2,
                stock = $3,
                category_id = $4

            WHERE id = $5

            RETURNING *
            `,
            [
                name,
                price,
                stock,
                category_id,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Produk tidak ditemukan"
            });
        }


        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(
            "Gagal mengedit produk:",
            error.message
        );

        res.status(500).json({
            error: "Gagal mengedit produk"
        });
    }
});


// ==============================
// DELETE HAPUS PRODUK
// ==============================

app.delete("/api/products/:id", async (req, res) => {
    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM products

            WHERE id = $1

            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Produk tidak ditemukan"
            });
        }


        res.json({

            message:
                "Produk berhasil dihapus",

            product:
                result.rows[0]

        });

    } catch (error) {

        console.error(
            "Gagal menghapus produk:",
            error.message
        );

        res.status(500).json({
            error: "Gagal menghapus produk"
        });
    }
});


// ==============================
// GET SEMUA KATEGORI
// ==============================

app.get("/api/categories", async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT *
            FROM categories
            ORDER BY id ASC
            `
        );


        res.json(
            result.rows
        );

    } catch (error) {

        console.error(
            "Gagal mengambil kategori:",
            error.message
        );

        res.status(500).json({
            error: "Gagal mengambil data kategori"
        });
    }
});


// ==============================
// POST TAMBAH KATEGORI
// ==============================

app.post("/api/categories", async (req, res) => {
    try {
        const { nama } = req.body;

        const result = await pool.query(
            `INSERT INTO categories (nama)
             VALUES ($1)
             RETURNING *`,
            [nama]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Gagal menambahkan kategori:", error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

// ==============================
// UPDATE CATEGORY
// ==============================

app.put("/api/categories/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const { nama } = req.body;

        const result = await pool.query(
            `UPDATE categories
             SET nama = $1
             WHERE id = $2
             RETURNING *`,
            [nama, id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Kategori tidak ditemukan"
            });

        }

        res.json({
            message: "Kategori berhasil diubah",
            category: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Gagal mengubah kategori:",
            error.message
        );

        res.status(500).json({
            error: error.message
        });

    }
});

app.delete("/api/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM categories
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Kategori tidak ditemukan"
            });
        }

        res.json({
            message: "Kategori berhasil dihapus",
            category: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal menghapus kategori:", error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

app.post("/api/transactions", async (req, res) => {
    const client = await pool.connect();

    try {
        const { items } = req.body;

        // Pastikan ada barang yang dibeli
        if (!items || items.length === 0) {
            return res.status(400).json({
                error: "Transaksi harus memiliki minimal satu produk"
            });
        }

        // Mulai database transaction
        await client.query("BEGIN");

        let total = 0;
        const transactionItems = [];

        // Ambil data setiap produk
        for (const item of items) {

            const productResult = await client.query(
                `SELECT id, nama, price, stock
                 FROM products
                 WHERE id = $1
                 FOR UPDATE`,
                [item.product_id]
            );

            if (productResult.rows.length === 0) {
                throw new Error(
                    `Produk dengan ID ${item.product_id} tidak ditemukan`
                );
            }

            const product = productResult.rows[0];

            const quantity = Number(item.quantity);

            // Validasi jumlah
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(
                    `Jumlah produk ${product.nama} tidak valid`
                );
            }

            // Pastikan stok mencukupi
            if (product.stock < quantity) {
                throw new Error(
                    `Stok ${product.nama} tidak mencukupi`
                );
            }

            const subtotal = product.price * quantity;

            total += subtotal;

            transactionItems.push({
                product_id: product.id,
                quantity: quantity,
                price: product.price,
                subtotal: subtotal
            });
        }

        // Simpan transaksi utama
        const transactionResult = await client.query(
            `INSERT INTO transactions (total)
             VALUES ($1)
             RETURNING *`,
            [total]
        );

        const transaction = transactionResult.rows[0];

        // Simpan detail transaksi dan kurangi stok
        for (const item of transactionItems) {

            await client.query(
                `INSERT INTO transaction_details
                 (transaction_id, product_id, quantity, price, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    transaction.id,
                    item.product_id,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]
            );

            await client.query(
                `UPDATE products
                 SET stock = stock - $1
                 WHERE id = $2`,
                [
                    item.quantity,
                    item.product_id
                ]
            );
        }

        // Semua proses berhasil
        await client.query("COMMIT");

        res.status(201).json({
            message: "Transaksi berhasil dibuat",
            transaction: transaction,
            items: transactionItems
        });

    } catch (error) {

        // Batalkan semua perubahan jika terjadi error
        await client.query("ROLLBACK");

        console.error(
            "Gagal membuat transaksi:",
            error.message
        );

        res.status(400).json({
            error: error.message
        });

    } finally {

        client.release();

    }
});

// ==============================
// MENJALANKAN SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `WarungKu berjalan di http://localhost:${PORT}`
    );

});