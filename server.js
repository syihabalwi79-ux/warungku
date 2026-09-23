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

// ==============================
// MENJALANKAN SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `WarungKu berjalan di http://localhost:${PORT}`
    );

});