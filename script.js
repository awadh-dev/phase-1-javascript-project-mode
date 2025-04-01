const booksContainer = document.getElementById("books");
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout-btn");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Load Dark Mode Preference
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = " Light Mode";
    }
    updateCart();
});

// Toggle Dark Mode
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
    
    darkModeToggle.textContent = isDarkMode ? " Light Mode" : "🌙 Dark Mode";
});

// Fetch Books from API
async function fetchBooks(query) {
    booksContainer.innerHTML = `<p class="loading">Searching for "${query}"...</p>`;

    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=10`);
        const data = await response.json();

        if (data.docs.length === 0) {
            booksContainer.innerHTML = `<p class="loading">No books found.</p>`;
            return;
        }

        displayBooks(data.docs);
    } catch (error) {
        booksContainer.innerHTML = `<p class="loading">Error fetching books.</p>`;
    }
}

// Display Books
function displayBooks(books) {
    booksContainer.innerHTML = "";
    books.forEach((book) => {
        const coverID = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "https://via.placeholder.com/150";
        const title = book.title || "Unknown Title";
        const priceKES = (Math.random() * (3000 - 1000) + 1000).toFixed(2); // Generate random price in KES

        const bookElement = document.createElement("div");
        bookElement.classList.add("book");
        bookElement.innerHTML = `
            <img src="${coverID}" alt="${title}">
            <h3>${title}</h3>
            <p>Price: KES ${priceKES}</p>
            <button class="add-to-cart" onclick="addToCart('${title}', '${coverID}', ${priceKES})">Add to Cart</button>
        `;
        booksContainer.appendChild(bookElement);
    });
}

// Add to Cart
function addToCart(title, cover, price) {
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title, cover, price, quantity: 1 });
    }

    updateCart();
}

// Update Cart
function updateCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((book, index) => {
        cartItemsContainer.innerHTML += `<li>${book.title} - KES ${book.price} (x${book.quantity}) 
            <button onclick="removeFromCart(${index})">❌</button></li>`;
        total += parseFloat(book.price) * book.quantity;
    });

    totalPriceElement.textContent = total.toFixed(2);
    checkoutBtn.disabled = cart.length === 0;

    // Save cart to local storage
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// **Checkout Function**
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    alert(`✅ Thank you for your purchase! Your total is KES ${totalPriceElement.textContent}`);

    // Clear the cart
    cart = [];
    localStorage.removeItem("cart");
    updateCart();
});

// Search Button Event
searchBtn.addEventListener("click", () => fetchBooks(searchInput.value.trim()));

// Load Default Books
fetchBooks("bestsellers");