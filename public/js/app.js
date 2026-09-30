const productList = document.getElementById("product-list");
const productForm = document.getElementById("product-form");

const navDashboard = document.getElementById("nav-dashboard");
const navProducts = document.getElementById("nav-products");
const navTransactions = document.getElementById("nav-transactions");

const pageSections = document.querySelectorAll("[data-page]");

const productCategory = document.getElementById("product-category");
const totalProducts = document.getElementById("total-products");
const totalCategories = document.getElementById("total-categories");
const totalStockValue = document.getElementById("total-stock-value");
const categoryList = document.getElementById("category-list");
const transactionForm = document.getElementById("transaction-form");
const transactionTotal = document.getElementById("transaction-total");
const addTransactionItemButton = document.getElementById("add-transaction-item");

let transactionProducts = [];


// ==============================
// FORMAT RUPIAH
// ==============================

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);

}


// ==============================
// LOAD PRODUCTS
// ==============================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        const products =
            await response.json();

        renderProducts(products);

    } catch (error) {

        console.error(
            "Gagal mengambil data produk:",
            error
        );

    }

}

async function loadDashboardStatistics() {

    try {

        const response =
            await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil statistik dashboard"
            );
        }

        const data =
            await response.json();

        const totalTransactions =
            document.getElementById(
                "total-transactions"
            );

        const totalRevenue =
            document.getElementById(
                "total-revenue"
            );

        const totalItemsSold =
            document.getElementById(
                "total-items-sold"
            );

        if (totalTransactions) {
            totalTransactions.textContent =
                data.total_transactions;
        }

        if (totalRevenue) {
            totalRevenue.textContent =
                formatRupiah(
                    data.total_revenue
                );
        }

        if (totalItemsSold) {
            totalItemsSold.textContent =
                data.total_items_sold;
        }

    } catch (error) {

        console.error(
            "Gagal memuat statistik dashboard:",
            error
        );

    }
}

async function loadTodaySales() {

    try {

        const response =
            await fetch(
                "/api/dashboard/today"
            );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil statistik hari ini"
            );
        }

        const data =
            await response.json();

        const todayTransactions =
            document.getElementById(
                "today-transactions"
            );

        const todayRevenue =
            document.getElementById(
                "today-revenue"
            );

        const todayItemsSold =
            document.getElementById(
                "today-items-sold"
            );

        if (todayTransactions) {
            todayTransactions.textContent =
                data.total_transactions;
        }

        if (todayRevenue) {
            todayRevenue.textContent =
                formatRupiah(
                    data.total_revenue
                );
        }

        if (todayItemsSold) {
            todayItemsSold.textContent =
                data.total_items_sold;
        }

    } catch (error) {

        console.error(
            "Gagal memuat statistik hari ini:",
            error
        );

    }
}

async function loadTopProducts() {

    const topProductsList =
        document.getElementById(
            "top-products-list"
        );

    if (!topProductsList) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/dashboard/top-products"
            );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil produk terlaris"
            );
        }

        const products =
            await response.json();

        topProductsList.innerHTML = "";

        if (products.length === 0) {

            topProductsList.innerHTML = `
                <p>
                    Belum ada data penjualan.
                </p>
            `;

            return;
        }

        products.forEach(
            (product, index) => {

                const productItem =
                    document.createElement(
                        "div"
                    );

                productItem.className =
                    "top-product-item";

                productItem.innerHTML = `
                    <div>
                        <strong>
                            ${index + 1}. ${product.nama}
                        </strong>
                    </div>

                    <strong>
                        ${product.total_sold} terjual
                    </strong>
                `;

                topProductsList.appendChild(
                    productItem
                );
            }
        );

    } catch (error) {

        console.error(
            "Gagal memuat produk terlaris:",
            error
        );

        topProductsList.innerHTML = `
            <p>
                Gagal memuat produk terlaris.
            </p>
        `;
    }
}

async function loadLowStock() {

    const lowStockList =
        document.getElementById(
            "low-stock-list"
        );

    if (!lowStockList) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/dashboard/low-stock"
            );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil data stok menipis"
            );
        }

        const products =
            await response.json();

        lowStockList.innerHTML = "";

        if (products.length === 0) {

            lowStockList.innerHTML = `
                <p>
                    Tidak ada produk dengan stok menipis.
                </p>
            `;

            return;
        }

        products.forEach(
            product => {

                const productItem =
                    document.createElement(
                        "div"
                    );

                productItem.className =
                    "low-stock-item";

                productItem.innerHTML = `
                    <div>
                        <strong>
                            ${product.nama}
                        </strong>
                    </div>

                    <strong>
                        ${product.stock} stok
                    </strong>
                `;

                lowStockList.appendChild(
                    productItem
                );
            }
        );

    } catch (error) {

        console.error(
            "Gagal memuat stok menipis:",
            error
        );

        lowStockList.innerHTML = `
            <p>
                Gagal memuat data stok.
            </p>
        `;
    }
}

async function loadSalesChart() {

    const chartContainer =
        document.getElementById(
            "sales-chart-container"
        );

    if (!chartContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/dashboard/sales-chart"
            );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil data grafik penjualan"
            );
        }

        const salesData =
            await response.json();

        chartContainer.innerHTML = "";

        if (salesData.length === 0) {

            chartContainer.innerHTML = `
                <p>
                    Belum ada data penjualan dalam 7 hari terakhir.
                </p>
            `;

            return;
        }

        const canvas =
            document.createElement("canvas");

        canvas.width = 700;
        canvas.height = 350;

        chartContainer.appendChild(canvas);

        const ctx =
            canvas.getContext("2d");

        const width = canvas.width;
        const height = canvas.height;

        const padding = 50;

        const chartWidth =
            width - padding * 2;

        const chartHeight =
            height - padding * 2;

        const maxRevenue =
            Math.max(
                ...salesData.map(
                    item => item.revenue
                ),
                1
            );

        /* Garis sumbu Y */

        ctx.beginPath();

        ctx.moveTo(
            padding,
            padding
        );

        ctx.lineTo(
            padding,
            height - padding
        );

        ctx.lineTo(
            width - padding,
            height - padding
        );

        ctx.stroke();

        /* Garis grafik */

        ctx.beginPath();

        salesData.forEach(
            (item, index) => {

                const x =
                    padding +
                    (
                        index /
                        Math.max(
                            salesData.length - 1,
                            1
                        )
                    ) *
                    chartWidth;

                const y =
                    height -
                    padding -
                    (
                        item.revenue /
                        maxRevenue
                    ) *
                    chartHeight;

                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );

        ctx.stroke();

        /* Titik grafik */

        salesData.forEach(
            (item, index) => {

                const x =
                    padding +
                    (
                        index /
                        Math.max(
                            salesData.length - 1,
                            1
                        )
                    ) *
                    chartWidth;

                const y =
                    height -
                    padding -
                    (
                        item.revenue /
                        maxRevenue
                    ) *
                    chartHeight;

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                /* Label tanggal */

                const date =
                    new Date(
                        item.date
                    );

                const dateLabel =
                    date.toLocaleDateString(
                        "id-ID",
                        {
                            day: "2-digit",
                            month: "2-digit"
                        }
                    );

                ctx.font =
                    "12px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    dateLabel,
                    x,
                    height - 25
                );

                /* Label omzet */

                ctx.fillText(
                    formatRupiah(
                        item.revenue
                    ),
                    x,
                    y - 10
                );

            }
        );

    } catch (error) {

        console.error(
            "Gagal memuat grafik penjualan:",
            error
        );

        chartContainer.innerHTML = `
            <p>
                Gagal memuat grafik penjualan.
            </p>
        `;
    }
}

// ==============================
// LOAD PRODUCTS FOR TRANSACTION
// ==============================

async function loadTransactionProducts() {

    try {

        const response =
            await fetch("/api/products");

        const products =
            await response.json();

        transactionProducts = products;

        /*
         * Isi semua dropdown transaksi
         * yang saat ini ada di halaman.
         */

        const transactionSelects =
            document.querySelectorAll(
                ".transaction-product"
            );

        transactionSelects.forEach(select => {

            const currentValue =
                select.value;

            select.innerHTML = `
                <option value="">
                    Pilih produk
                </option>
            `;

            products.forEach(product => {

                const option =
                    document.createElement("option");

                option.value =
                    product.id;

                option.textContent =
                    `${product.nama} - ${formatRupiah(product.price)} (Stok: ${product.stock})`;

                select.appendChild(option);

            });

            /*
             * Kalau produk yang sebelumnya dipilih
             * masih ada, pertahankan pilihan tersebut.
             */

            if (
                currentValue &&
                products.some(
                    product =>
                        product.id ===
                        Number(currentValue)
                )
            ) {

                select.value =
                    currentValue;

            }

        });

    } catch (error) {

        console.error(
            "Gagal mengambil produk transaksi:",
            error
        );

    }

}


// ==============================
// RENDER PRODUCTS
// ==============================

function renderProducts(products) {

    productList.innerHTML = "";

    totalProducts.textContent =
        products.length;


    // Menghitung nilai seluruh stok

    let stockValue = 0;

    products.forEach(product => {

        stockValue +=
            product.price *
            product.stock;

    });

    totalStockValue.textContent =
        formatRupiah(stockValue);


    // Menampilkan produk

    products.forEach(product => {

        const productCard =
            document.createElement("div");

        productCard.className =
            "card";

        productCard.innerHTML = `
            <h3>${product.nama}</h3>

            <p>
                Kategori:
                ${product.category_name ?? "Tanpa kategori"}
            </p>

            <p>
                Harga:
                ${formatRupiah(product.price)}
            </p>

            <p>
                Stok:
                ${product.stock}
            </p>

            <button onclick="editProduct(${product.id})">
                Edit
            </button>

            <button onclick="deleteProduct(${product.id})">
                Hapus
            </button>
        `;

        productList.appendChild(
            productCard
        );

    });

}


// ==============================
// LOAD CATEGORIES
// ==============================

async function loadCategories() {

    try {

        const response =
            await fetch("/api/categories");

        const categories =
            await response.json();

        renderCategories(
            categories
        );

        renderCategoryManagement(
            categories
        );

    } catch (error) {

        console.error(
            "Gagal mengambil data kategori:",
            error
        );

    }

}


// ==============================
// RENDER CATEGORY DROPDOWN
// ==============================

function renderCategories(categories) {

    totalCategories.textContent =
        categories.length;

    productCategory.innerHTML = `
        <option value="">
            Pilih kategori
        </option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.nama;

        productCategory.appendChild(
            option
        );

    });

}


// ==============================
// RENDER CATEGORY MANAGEMENT
// ==============================

function renderCategoryManagement(categories) {

    categoryList.innerHTML = "";

    categories.forEach(category => {

        const categoryItem =
            document.createElement("div");

        categoryItem.className =
            "category-item";

        categoryItem.innerHTML = `
            <span>
                ${category.nama}
            </span>

            <button
                onclick="editCategory(${category.id})"
            >
                Edit
            </button>

            <button
                onclick="deleteCategory(${category.id})"
            >
                Hapus
            </button>
        `;

        categoryList.appendChild(
            categoryItem
        );

    });

}


// ==============================
// TAMBAH PRODUCT
// ==============================

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const name =
            document
                .getElementById(
                    "product-name"
                )
                .value;

        const category_id =
            document
                .getElementById(
                    "product-category"
                )
                .value;

        const price =
            document
                .getElementById(
                    "product-price"
                )
                .value;

        const stock =
            document
                .getElementById(
                    "product-stock"
                )
                .value;


        try {

            const response =
                await fetch(
                    "/api/products",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            price:
                                Number(price),

                            stock:
                                Number(stock),

                            category_id:
                                Number(
                                    category_id
                                )

                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Gagal menambahkan produk"
                );

            }


            productForm.reset();


            // Update daftar produk

            await loadProducts();


            // Update produk yang tersedia
            // di transaksi

            await loadTransactionProducts();


        } catch (error) {

            console.error(error);

            alert(
                "Gagal menambahkan produk"
            );

        }

    }
);


// ==============================
// EDIT PRODUCT
// ==============================

async function editProduct(id) {

    try {

        const response =
            await fetch(
                "/api/products"
            );

        const products =
            await response.json();

        const product =
            products.find(
                item =>
                    item.id === id
            );


        if (!product) {

            alert(
                "Produk tidak ditemukan"
            );

            return;

        }


        const newName =
            prompt(
                "Nama produk:",
                product.nama
            );

        if (newName === null) return;


        const newPrice =
            prompt(
                "Harga:",
                product.price
            );

        if (newPrice === null) return;


        const newStock =
            prompt(
                "Stok:",
                product.stock
            );

        if (newStock === null) return;


        const newCategory =
            prompt(
                "ID kategori:",
                product.category_id ?? ""
            );

        if (newCategory === null) return;


        const responseUpdate =
            await fetch(
                `/api/products/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            newName,

                        price:
                            Number(
                                newPrice
                            ),

                        stock:
                            Number(
                                newStock
                            ),

                        category_id:
                            Number(
                                newCategory
                            )

                    })

                }
            );


        if (!responseUpdate.ok) {

            throw new Error(
                "Gagal mengedit produk"
            );

        }


        await loadProducts();

        await loadTransactionProducts();


    } catch (error) {

        console.error(
            "Gagal mengedit produk:",
            error
        );

    }

}


// ==============================
// DELETE PRODUCT
// ==============================

async function deleteProduct(id) {

    const confirmation =
        confirm(
            "Yakin ingin menghapus produk ini?"
        );


    if (!confirmation) return;


    try {

        const response =
            await fetch(
                `/api/products/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gagal menghapus produk"
            );

        }


        await loadProducts();

        await loadTransactionProducts();


    } catch (error) {

        console.error(
            "Gagal menghapus produk:",
            error
        );

    }

}


// ==============================
// EDIT CATEGORY
// ==============================

async function editCategory(id) {

    try {

        const response =
            await fetch(
                "/api/categories"
            );

        const categories =
            await response.json();

        const category =
            categories.find(
                item =>
                    item.id === id
            );


        if (!category) {

            alert(
                "Kategori tidak ditemukan"
            );

            return;

        }


        const newName =
            prompt(
                "Nama kategori:",
                category.nama
            );


        if (newName === null) return;


        if (newName.trim() === "") {

            alert(
                "Nama kategori tidak boleh kosong"
            );

            return;

        }


        const updateResponse =
            await fetch(
                `/api/categories/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        nama: newName
                    })

                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                "Gagal mengubah kategori"
            );

        }


        await loadCategories();


    } catch (error) {

        console.error(
            "Gagal mengedit kategori:",
            error
        );

        alert(
            "Gagal mengedit kategori"
        );

    }

}


// ==============================
// DELETE CATEGORY
// ==============================

async function deleteCategory(id) {

    const confirmation =
        confirm(
            "Yakin ingin menghapus kategori ini?"
        );


    if (!confirmation) return;


    try {

        const response =
            await fetch(
                `/api/categories/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gagal menghapus kategori"
            );

        }


        await loadCategories();


    } catch (error) {

        console.error(error);

        alert(
            "Kategori gagal dihapus. Pastikan kategori tidak sedang digunakan oleh produk."
        );

    }

}


// ==============================
// TAMBAH CATEGORY
// ==============================

const categoryForm =
    document.getElementById(
        "category-form"
    );


categoryForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const categoryName =
            document
                .getElementById(
                    "category-name"
                )
                .value;


        try {

            const response =
                await fetch(
                    "/api/categories",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nama:
                                categoryName
                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Gagal menambahkan kategori"
                );

            }


            categoryForm.reset();


            await loadCategories();


        } catch (error) {

            console.error(error);

            alert(
                "Gagal menambahkan kategori"
            );

        }

    }
);


// ==============================
// CALCULATE TRANSACTION TOTAL
// ==============================

function calculateTransactionTotal() {

    const transactionItems =
        document.querySelectorAll(
            ".transaction-item"
        );

    let total = 0;

    transactionItems.forEach(item => {

        const productSelect =
            item.querySelector(
                ".transaction-product"
            );

        const quantityInput =
            item.querySelector(
                ".transaction-quantity"
            );

        const productId =
            Number(productSelect.value);

        const quantity =
            Number(quantityInput.value);

        const product =
            transactionProducts.find(
                product =>
                    product.id === productId
            );

        if (!product || quantity <= 0) {
            return;
        }

        // ==============================
        // VALIDASI STOK
        // ==============================

        if (quantity > product.stock) {

            quantityInput.setCustomValidity(
                `Stok ${product.nama} hanya ${product.stock}.`
            );

            quantityInput.reportValidity();

            return;

        }

        quantityInput.setCustomValidity("");

        total +=
            product.price * quantity;

    });

    transactionTotal.textContent =
        formatRupiah(total);

}


// ==============================
// ADD TRANSACTION ITEM
// ==============================

function addTransactionItem() {

    const transactionItems =
        document.getElementById(
            "transaction-items"
        );


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "transaction-item";


    item.innerHTML = `

        <select
            class="transaction-product"
            required
        >

            <option value="">
                Pilih produk
            </option>

        </select>


        <input
            type="number"
            class="transaction-quantity"
            min="1"
            value="1"
            required
        >


        <button
            type="button"
            class="remove-transaction-item"
        >
            Hapus
        </button>

    `;


    transactionItems.appendChild(
        item
    );


    populateTransactionProduct(
        item
    );


    setupTransactionItemEvents(
        item
    );


    calculateTransactionTotal();

}


// ==============================
// POPULATE PRODUCT DROPDOWN
// ==============================

function populateTransactionProduct(
    item
) {

    const select =
        item.querySelector(
            ".transaction-product"
        );


    const currentValue =
        select.value;


    select.innerHTML = `

        <option value="">
            Pilih produk
        </option>

    `;


    transactionProducts.forEach(
        product => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                `${product.nama} - ${formatRupiah(product.price)} (Stok: ${product.stock})`;


            select.appendChild(
                option
            );

        }
    );


    if (
        currentValue &&
        transactionProducts.some(
            product =>
                product.id ===
                Number(currentValue)
        )
    ) {

        select.value =
            currentValue;

    }

}


// ==============================
// SETUP TRANSACTION ITEM
// ==============================

function setupTransactionItemEvents(
    item
) {

    const select =
        item.querySelector(
            ".transaction-product"
        );


    const quantity =
        item.querySelector(
            ".transaction-quantity"
        );


    const removeButton =
        item.querySelector(
            ".remove-transaction-item"
        );


    select.addEventListener(
        "change",
        calculateTransactionTotal
    );


    quantity.addEventListener(
        "input",
        calculateTransactionTotal
    );


    removeButton.addEventListener(
        "click",
        function() {

            item.remove();

            calculateTransactionTotal();

        }
    );

}


// ==============================
// ADD ITEM BUTTON
// ==============================

if (addTransactionItemButton) {

    addTransactionItemButton.addEventListener(
        "click",
        addTransactionItem
    );

}


// ==============================
// SETUP FIRST TRANSACTION ITEM
// ==============================

const firstTransactionItem =
    document.querySelector(
        ".transaction-item"
    );


if (firstTransactionItem) {

    setupTransactionItemEvents(
        firstTransactionItem
    );

}

// ==============================
// SIMPAN TRANSAKSI
// ==============================

if (transactionForm) {

    transactionForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const transactionItems =
                document.querySelectorAll(
                    ".transaction-item"
                );

                let stockIsValid = true;

                transactionItems.forEach(item => {
                
                    const productSelect =
                        item.querySelector(
                            ".transaction-product"
                        );
                
                    const quantityInput =
                        item.querySelector(
                            ".transaction-quantity"
                        );
                
                    const productId =
                        Number(productSelect.value);
                
                    const quantity =
                        Number(quantityInput.value);
                
                    const product =
                        transactionProducts.find(
                            product =>
                                product.id === productId
                        );
                
                    if (
                        product &&
                        quantity > product.stock
                    ) {
                
                        quantityInput.setCustomValidity(
                            `Stok ${product.nama} hanya ${product.stock}.`
                        );
                
                        stockIsValid = false;
                
                    } else {
                
                        quantityInput.setCustomValidity("");
                
                    }
                
                });
                
                
                if (!stockIsValid) {
                
                    transactionForm.reportValidity();
                
                    return;
                
                }


            const items = [];


            transactionItems.forEach(
                item => {

                    const productSelect =
                        item.querySelector(
                            ".transaction-product"
                        );

                    const quantityInput =
                        item.querySelector(
                            ".transaction-quantity"
                        );


                    const productId =
                        Number(
                            productSelect.value
                        );


                    const quantity =
                        Number(
                            quantityInput.value
                        );


                    if (
                        productId &&
                        quantity > 0
                    ) {

                        items.push({

                            product_id:
                                productId,

                            quantity:
                                quantity

                        });

                    }

                }
            );


            // Tidak boleh menyimpan
            // transaksi tanpa produk

            if (items.length === 0) {

                alert(
                    "Pilih minimal satu produk."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "/api/transactions",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    items: items
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Gagal menyimpan transaksi"
                    );

                }


                alert(
                    "Transaksi berhasil disimpan!"
                );


                // Reset form

                transactionForm.reset();


                // Hapus item tambahan,
                // sisakan satu item pertama

                const allItems =
                    document.querySelectorAll(
                        ".transaction-item"
                    );


                allItems.forEach(
                    (item, index) => {

                        if (index > 0) {

                            item.remove();

                        }

                    }
                );


                // Reset total

                calculateTransactionTotal();


                // Update data produk
                // karena stok kemungkinan berubah

                await loadProducts();

                await loadTransactionProducts();

                await loadTransactionHistory();


            } catch (error) {

                console.error(
                    "Gagal menyimpan transaksi:",
                    error
                );


                alert(
                    "Gagal menyimpan transaksi: " +
                    error.message
                );

            }

        }
    );

}

// ==============================
// LOAD RIWAYAT TRANSAKSI
// ==============================

async function loadTransactionHistory() {

    const historyList =
        document.getElementById(
            "transaction-history-list"
        );

    if (!historyList) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/transactions"
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil riwayat transaksi"
            );

        }


        const transactions =
            await response.json();


        historyList.innerHTML = "";


        if (transactions.length === 0) {

            historyList.innerHTML = `
                <p>
                    Belum ada transaksi.
                </p>
            `;

            return;

        }


        transactions.forEach(
            transaction => {

                const transactionItem =
                    document.createElement(
                        "div"
                    );


                transactionItem.className =
                    "transaction-history-item";


                const date =
                    new Date(
                        transaction.created_at
                    );


                const formattedDate =
                    date.toLocaleString(
                        "id-ID"
                    );


                transactionItem.innerHTML = `

                    <div>

                        <strong>
                            Transaksi #${transaction.id}
                        </strong>

                        <p>
                            ${formattedDate}
                        </p>

                    </div>


                    <strong>
                        ${formatRupiah(
                            transaction.total
                        )}
                    </strong>

                `;


                /*
                 * Membuat transaksi
                 * bisa diklik.
                 */

                transactionItem.style.cursor =
                    "pointer";


                transactionItem.addEventListener(
                    "click",
                    function() {

                        loadTransactionDetail(
                            transaction.id,
                            transactionItem
                        );

                    }
                );


                historyList.appendChild(
                    transactionItem
                );

            }
        );


    } catch (error) {

        console.error(
            "Gagal memuat riwayat transaksi:",
            error
        );


        historyList.innerHTML = `
            <p>
                Gagal memuat riwayat transaksi.
            </p>
        `;

    }

}

async function loadTransactionDetail(
    transactionId,
    transactionElement
) {

    try {

        const existingDetail =
            transactionElement.nextElementSibling;


        /*
         * Kalau detail sedang terbuka,
         * klik lagi untuk menutupnya.
         */

        if (
            existingDetail &&
            existingDetail.classList.contains(
                "transaction-detail"
            )
        ) {

            existingDetail.remove();

            return;

        }


        const response =
            await fetch(
                `/api/transactions/${transactionId}`
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil detail transaksi"
            );

        }


        const transaction =
            await response.json();


        const detail =
            document.createElement(
                "div"
            );


        detail.className =
            "transaction-detail";


        detail.innerHTML = `

            <h3>
                Detail Transaksi #${transaction.id}
            </h3>


            <div class="transaction-detail-items">

                ${transaction.items.map(item => `

                    <div class="transaction-detail-item">

                        <div>

                            <strong>
                                ${item.product_name}
                            </strong>

                            <p>
                                ${item.quantity}
                                ×
                                ${formatRupiah(item.price)}
                            </p>

                        </div>


                        <strong>
                            ${formatRupiah(item.subtotal)}
                        </strong>

                    </div>

                `).join("")}

            </div>


            <div class="transaction-detail-total">

                <strong>
                    Total
                </strong>

                <strong>
                    ${formatRupiah(
                        transaction.total
                    )}
                </strong>

            </div>

        `;


        transactionElement.after(
            detail
        );


    } catch (error) {

        console.error(
            "Gagal memuat detail transaksi:",
            error
        );


        alert(
            "Gagal mengambil detail transaksi"
        );

    }

}

function showPage(pageName) {
    pageSections.forEach(section => {
        const pages = section.dataset.page.split(" ");

        if (pages.includes(pageName)) {
            section.style.display = "";
        } else {
            section.style.display = "none";
        }
    });

    navDashboard.classList.remove("active");
    navProducts.classList.remove("active");
    navTransactions.classList.remove("active");

    if (pageName === "dashboard") {
        navDashboard.classList.add("active");
    }

    if (pageName === "products") {
        navProducts.classList.add("active");
    }

    if (pageName === "transactions") {
        navTransactions.classList.add("active");
    }
    if (pageName === "dashboard") {
        document.title = "WarungKu - Dashboard";
    }
    
    if (pageName === "products") {
        document.title = "WarungKu - Produk";
    }
    
    if (pageName === "transactions") {
        document.title = "WarungKu - Transaksi";
    }
}

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

navDashboard.addEventListener("click", function (event) {
    event.preventDefault();
    showPage("dashboard");
});

navProducts.addEventListener("click", function (event) {
    event.preventDefault();
    showPage("products");
});

navTransactions.addEventListener("click", function (event) {
    event.preventDefault();
    showPage("transactions");
});

showPage("dashboard");

// ==============================
// LOAD DATA SAAT HALAMAN DIBUKA
// ==============================

loadCategories();

loadProducts();

loadTransactionProducts();

loadTransactionHistory();

loadDashboardStatistics();

loadTopProducts();

loadTodaySales();

loadLowStock();

loadSalesChart();

if (firstTransactionItem) {

    setupTransactionItemEvents(
        firstTransactionItem
    );

}