const productList = document.getElementById("product-list");
const productForm = document.getElementById("product-form");
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
// LOAD DATA SAAT HALAMAN DIBUKA
// ==============================

loadCategories();

loadProducts();

loadTransactionProducts();

if (firstTransactionItem) {

    setupTransactionItemEvents(
        firstTransactionItem
    );

}