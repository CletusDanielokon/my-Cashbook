document.addEventListener("DOMContentLoaded", function () {


    // =========================================
    // 1. CHECK USER LOGIN
    // =========================================

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("cashbookUser"));
    } catch (error) {
        user = null;
    }


    if (!user) {

        window.location.href = "index.html";

        return;

    }


    // =========================================
    // 2. SHOW USER INFORMATION
    // =========================================

    const fullName =
        user.fullName ||
        user.name ||
        user.username ||
        "CashBook User";

    const names =
        fullName.trim().split(/\s+/);

    let initials =
        names[0].charAt(0).toUpperCase();

    if (names.length > 1) {

        initials +=
            names[names.length - 1].charAt(0).toUpperCase();

    }


    function setText(id, text) {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = text;

        }

    }


    setText("profile-initials", initials);
    setText("profileHeaderInitials", initials);
    setText("user-name-header", names[0]);
    setText("sidebar-user-name", names[0]);
    setText("header-user-name", names[0]);


    // =========================================
    // 3. GET HTML ELEMENTS
    // =========================================

    const totalIncomeElement =
        document.getElementById("total-income");

    const totalExpensesElement =
        document.getElementById("total-expenses");

    const netBalanceElement =
        document.getElementById("net-balance");

    const transactionsList =
        document.getElementById("transactions-list");

    const searchInput =
        document.getElementById("search-input");

    const periodFilter =
        document.getElementById("period-filter");

    const categoryFilter =
        document.getElementById("category-filter");

    const typeFilter =
        document.getElementById("type-filter");

    const startDateInput =
        document.getElementById("start-date");

    const endDateInput =
        document.getElementById("end-date");

    const customDateFields =
        document.getElementById("custom-date-fields");

    const endDateField =
        document.getElementById("end-date-field");


    // =========================================
    // 4. GET SAVED TRANSACTIONS
    // =========================================

    let transactions = [];

    try {

        transactions =
            JSON.parse(localStorage.getItem("cashbookTransactions")) || [];

    } catch (error) {

        transactions = [];

    }

    // The id of the transaction being edited (null = adding a new one)
    let editingTransactionId = null;


    function saveTransactions() {

        localStorage.setItem(
            "cashbookTransactions",
            JSON.stringify(transactions)
        );

    }


    // =========================================
    // 5. HELPERS
    // =========================================

    // Format an amount as Naira
    function formatNaira(amount) {

        return new Intl.NumberFormat("en-NG", {

            style: "currency",

            currency: "NGN",

            minimumFractionDigits: 2

        }).format(amount);

    }


    // Stop text typed by the user from being read as HTML
    function escapeHTML(value) {

        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    }


    // Today's date (local time) as YYYY-MM-DD
    function getTodayForInput() {

        const today =
            new Date();

        return (

            today.getFullYear() +

            "-" +

            String(today.getMonth() + 1).padStart(2, "0") +

            "-" +

            String(today.getDate()).padStart(2, "0")

        );

    }


    // 12 Sep 2026
    function formatDate(dateString) {

        const date =
            new Date(dateString + "T00:00:00");

        if (isNaN(date.getTime())) {

            return dateString;

        }

        return date.toLocaleDateString("en-NG", {

            day: "numeric",

            month: "short",

            year: "numeric"

        });

    }


    // Icon for each category
    const categoryIcons = {

        Food: "fa-utensils",

        Transport: "fa-car",

        Data: "fa-wifi",

        Airtime: "fa-phone",

        Salary: "fa-money-bill",

        Business: "fa-briefcase",

        Entertainment: "fa-film",

        Utilities: "fa-bolt",

        Other: "fa-receipt"

    };


    // =========================================
    // 6. CHECK DATE FILTER
    // =========================================

    function passesDateFilter(transactionDate) {

        const selectedPeriod =
            periodFilter.value;


        if (selectedPeriod === "all") {

            return true;

        }


        const transactionDateObject =
            new Date(transactionDate + "T00:00:00");


        const today =
            new Date();

        today.setHours(0, 0, 0, 0);



        if (selectedPeriod === "today") {

            return transactionDate === getTodayForInput();

        }



        if (selectedPeriod === "week") {

            const firstDayOfWeek =
                new Date(today);

            const day =
                today.getDay();

            firstDayOfWeek.setDate(
                today.getDate() - day
            );

            return transactionDateObject >= firstDayOfWeek;

        }



        if (selectedPeriod === "month") {

            return (

                transactionDateObject.getMonth() ===
                today.getMonth()

                &&

                transactionDateObject.getFullYear() ===
                today.getFullYear()

            );

        }



        if (selectedPeriod === "last30") {

            const last30Days =
                new Date(today);

            last30Days.setDate(
                today.getDate() - 30
            );

            return transactionDateObject >= last30Days;

        }



        if (selectedPeriod === "custom") {

            const startDate =
                startDateInput.value;

            const endDate =
                endDateInput.value;


            if (startDate && transactionDate < startDate) {

                return false;

            }


            if (endDate && transactionDate > endDate) {

                return false;

            }


            return true;

        }


        return true;

    }


    // =========================================
    // 7. FILTER TRANSACTIONS
    // =========================================

    function getFilteredTransactions() {

        const searchTerm =
            searchInput.value.toLowerCase().trim();


        const selectedCategory =
            categoryFilter.value;


        const selectedType =
            typeFilter.value;


        return transactions.filter(function (transaction) {


            const searchableText = (

                transaction.description +

                " " +

                transaction.category +

                " " +

                (transaction.note || "")

            ).toLowerCase();


            const matchesSearch =
                searchableText.includes(searchTerm);


            const matchesCategory =

                selectedCategory === "all" ||

                transaction.category === selectedCategory;


            const matchesType =

                selectedType === "all" ||

                transaction.type === selectedType;


            const matchesDate =
                passesDateFilter(transaction.date);


            return (

                matchesSearch &&

                matchesCategory &&

                matchesType &&

                matchesDate

            );

        });

    }


    // =========================================
    // 8. DISPLAY SUMMARY CARDS
    // =========================================

    function displaySummary(filteredTransactions) {

        let totalIncome =
            0;

        let totalExpenses =
            0;


        filteredTransactions.forEach(function (transaction) {

            if (transaction.type === "income") {

                totalIncome += Number(transaction.amount);

            }


            if (transaction.type === "expense") {

                totalExpenses += Number(transaction.amount);

            }

        });


        const balance =
            totalIncome - totalExpenses;


        totalIncomeElement.textContent =
            formatNaira(totalIncome);

        totalExpensesElement.textContent =
            formatNaira(totalExpenses);

        netBalanceElement.textContent =
            formatNaira(balance);

    }


    // =========================================
    // 9. DISPLAY TRANSACTIONS
    // =========================================

    function emptyState(title, message) {

        return `

            <div class="px-5 py-12 text-center">

                <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <i class="fa-solid fa-receipt"></i>
                </div>

                <p class="font-medium text-slate-900 dark:text-slate-100">
                    ${title}
                </p>

                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    ${message}
                </p>

            </div>

        `;

    }


    function displayTransactions() {

        const filteredTransactions =
            getFilteredTransactions();


        displaySummary(filteredTransactions);


        if (filteredTransactions.length === 0) {

            transactionsList.innerHTML =
                transactions.length === 0
                ? emptyState(
                    "No transactions yet",
                    "Use the Income or Expense button to add your first transaction."
                  )
                : emptyState(
                    "No transactions found",
                    "Try changing or clearing your filters."
                  );

            return;

        }


        const sortedTransactions =
            filteredTransactions.slice().reverse();


        transactionsList.innerHTML =

            sortedTransactions.map(function (transaction) {


                const isIncome =
                    transaction.type === "income";


                const sign =
                    isIncome ? "+" : "-";


                const amountClass =
                    isIncome ? "text-green" : "text-red-500";


                const badgeClass =
                    isIncome
                    ? "bg-green/10 text-green"
                    : "bg-red-500/10 text-red-500";


                const iconClass =
                    "fa-solid " +
                    (categoryIcons[transaction.category] || "fa-receipt");


                const description =
                    escapeHTML(transaction.description);


                const category =
                    escapeHTML(transaction.category);


                const dateAndTime =
                    escapeHTML(formatDate(transaction.date)) +
                    (transaction.time
                        ? " &bull; " + escapeHTML(transaction.time)
                        : "");


                return `

                    <div class="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">

                        <div class="w-11 h-11 rounded-lg ${badgeClass} flex items-center justify-center shrink-0">
                            <i class="${iconClass}"></i>
                        </div>

                        <div class="min-w-0 flex-1">

                            <p class="font-medium text-slate-900 dark:text-slate-100 truncate">
                                ${description}
                            </p>

                            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                                ${category}
                            </p>

                            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                ${dateAndTime}
                            </p>

                        </div>

                        <div class="flex flex-col items-end gap-1 shrink-0">

                            <p class="font-semibold whitespace-nowrap ${amountClass}">
                                ${sign}${formatNaira(transaction.amount)}
                            </p>

                            <div class="flex items-center gap-1">

                                <button
                                    type="button"
                                    data-action="edit"
                                    data-id="${transaction.id}"
                                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green/50"
                                    aria-label="Edit ${description}"
                                    title="Edit"
                                >
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>

                                <button
                                    type="button"
                                    data-action="delete"
                                    data-id="${transaction.id}"
                                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                                    aria-label="Delete ${description}"
                                    title="Delete"
                                >
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    // Edit and delete buttons (one listener for the whole list)

    transactionsList.addEventListener("click", function (event) {

        const button =
            event.target.closest("button[data-action]");

        if (!button) {

            return;

        }

        const id =
            Number(button.dataset.id);

        if (button.dataset.action === "edit") {

            editTransaction(id);

        }

        if (button.dataset.action === "delete") {

            deleteTransaction(id);

        }

    });


    // =========================================
    // 10. DELETE TRANSACTION
    // =========================================

    function deleteTransaction(id) {

        const confirmDelete =
            confirm("Are you sure you want to delete this transaction?");


        if (!confirmDelete) {

            return;

        }


        transactions =
            transactions.filter(function (transaction) {

                return Number(transaction.id) !== id;

            });


        saveTransactions();


        displayTransactions();

    }


    // =========================================
    // 11. MODAL
    // =========================================

    const modal =
        document.getElementById("transactionModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const transactionTypeInput =
        document.getElementById("transactionType");

    const transactionForm =
        document.getElementById("transactionForm");

    const transactionDateInput =
        document.getElementById("transactionDate");

    const transactionTimeInput =
        document.getElementById("transactionTime");


    // Add a new transaction
    function openModal(type) {

        editingTransactionId = null;

        transactionForm.reset();

        transactionTypeInput.value =
            type;

        modalTitle.textContent =
            type === "income"
            ? "Add Income"
            : "Add Expense";

        transactionDateInput.value =
            getTodayForInput();

        if (transactionTimeInput) {

            const now = new Date();

            const hours =
                String(now.getHours()).padStart(2, "0");

            const minutes =
                String(now.getMinutes()).padStart(2, "0");

            transactionTimeInput.value =
                `${hours}:${minutes}`;
        }

        modal.showModal();

    }


    // Edit an existing transaction
    function editTransaction(id) {

        const transaction =
            transactions.find(function (item) {

                return Number(item.id) === id;

            });


        if (!transaction) {

            return;

        }


        editingTransactionId =
            transaction.id;

        transactionForm.reset();

        transactionTypeInput.value =
            transaction.type;

        modalTitle.textContent =
            transaction.type === "income"
            ? "Edit Income"
            : "Edit Expense";

        document.getElementById("description").value =
            transaction.description;

        document.getElementById("amount").value =
            transaction.amount;

        transactionDateInput.value =
            transaction.date;

        if (transactionTimeInput) {

            transactionTimeInput.value =
                transaction.time || "";

        }

        document.getElementById("category").value =
            transaction.category;

        modal.showModal();

    }


    function closeModal() {

        modal.close();

    }


    // Always leave "edit mode" when the modal closes (button, Esc key or backdrop)
    modal.addEventListener("close", function () {

        editingTransactionId = null;

    });


    // Click on the dark area outside the modal
    modal.addEventListener("click", function (event) {

        if (event.target === modal) {

            closeModal();

        }

    });


    document
        .getElementById("add-income")
        .addEventListener("click", function () {

            openModal("income");

        });


    document
        .getElementById("add-expense")
        .addEventListener("click", function () {

            openModal("expense");

        });


    document
        .getElementById("close-modal")
        .addEventListener("click", closeModal);


    document
        .getElementById("cancel-modal")
        .addEventListener("click", closeModal);


    // =========================================
    // 12. SAVE TRANSACTION (ADD OR EDIT)
    // =========================================

    transactionForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const description =
            document.getElementById("description").value.trim();


        const amount =
            Number(document.getElementById("amount").value);


        const date =
            transactionDateInput.value;


        const time =
            transactionTimeInput ? transactionTimeInput.value : "";


        const category =
            document.getElementById("category").value;


        const type =
            transactionTypeInput.value;


        if (

            description === "" ||

            !(amount > 0) ||

            date === "" ||

            category === ""

        ) {

            alert("Please fill in all fields correctly.");

            return;

        }


        if (editingTransactionId !== null) {

            // Update the existing transaction

            const index =
                transactions.findIndex(function (item) {

                    return item.id === editingTransactionId;

                });


            if (index !== -1) {

                transactions[index].description = description;

                transactions[index].amount = amount;

                transactions[index].date = date;

                transactions[index].time = time;

                transactions[index].category = category;

            }

        } else {

            // Add a new transaction

            transactions.push({

                id: Date.now(),

                description: description,

                amount: amount,

                date: date,

                time: time,

                category: category,

                type: type

            });

        }


        saveTransactions();


        transactionForm.reset();


        closeModal();


        displayTransactions();

    });


    // =========================================
    // 13. FILTER EVENTS
    // =========================================

    searchInput.addEventListener(
        "input",
        displayTransactions
    );


    periodFilter.addEventListener(
        "change",
        function () {


            if (periodFilter.value === "custom") {

                customDateFields.classList.remove("hidden");

                endDateField.classList.remove("hidden");

            } else {

                customDateFields.classList.add("hidden");

                endDateField.classList.add("hidden");

            }


            displayTransactions();

        }
    );


    categoryFilter.addEventListener(
        "change",
        displayTransactions
    );


    typeFilter.addEventListener(
        "change",
        displayTransactions
    );


    startDateInput.addEventListener(
        "change",
        displayTransactions
    );


    endDateInput.addEventListener(
        "change",
        displayTransactions
    );


    // =========================================
    // 14. CLEAR FILTERS
    // =========================================

    document
        .getElementById("clear-filters")
        .addEventListener("click", function () {

            searchInput.value = "";

            periodFilter.value = "all";

            categoryFilter.value = "all";

            typeFilter.value = "all";

            startDateInput.value = "";

            endDateInput.value = "";

            customDateFields.classList.add("hidden");

            endDateField.classList.add("hidden");

            displayTransactions();

        });


    // =========================================
    // 15. NAVIGATION
    // =========================================

    const routes = [

        { id: "dashboard-link", target: "dashboard.html" },

        { id: "transactions-link", target: "transactions.html" },

        { id: "budget-link", target: "budget.html" },

        { id: "reports-link", target: "reports.html" },

        { id: "profile-link", target: "profile.html" },

        { id: "settings-link", target: "settings.html" }

    ];


    routes.forEach(function (route) {

        const button =
            document.getElementById(route.id);

        if (button) {

            button.addEventListener("click", function () {

                window.location.href = route.target;

            });

        }

    });


    // =========================================
    // 16. LOGOUT
    // =========================================

    document
        .getElementById("logout-link")
        .addEventListener("click", function () {

            const confirmLogout =
                confirm("Are you sure you want to logout?");


            if (confirmLogout) {

                localStorage.removeItem("cashbookUser");

                window.location.href = "index.html";

            }

        });


    // =========================================
    // 17. INITIAL DISPLAY
    // =========================================

    displayTransactions();

});