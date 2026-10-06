document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // CHECK LOGIN
    // =================================

    const user = JSON.parse(
        localStorage.getItem("cashbookUser")
    );

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    
    // =================================
    // USER PROFILE
    // =================================

    const userName =
        user.name ||
        user.fullName ||
        user.username ||
        "User";

    const profileInitial =
        userName.charAt(0).toUpperCase();


    document.getElementById("user-name").textContent =
        userName;

    document.getElementById("top-user-name").textContent =
        userName;

    document.getElementById("profile-initials").textContent =
        profileInitial;

    document.getElementById("top-profile-initials").textContent =
        profileInitial;
    


    // =================================
    // GET TRANSACTIONS
    // =================================

    let transactions = [];

    async function loadTransactions() {

        try {

            const token =
                localStorage.getItem("cashbookToken");

            const response =
                await fetch(
                    "http://localhost:5000/api/transactions",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                console.error(
                    data.message ||
                    "Unable to load transactions."
                );

                return;
            }

            transactions =
                data.transactions || [];

            generateReport();

        } catch (error) {

            console.error(
                "Error loading report transactions:",
                error
            );

        }
    }

    // =================================
    // ELEMENTS
    // =================================

    const startDate =
        document.getElementById("start-date");

    const endDate =
        document.getElementById("end-date");


    // =================================
    // FORMAT NAIRA
    // =================================

    function formatNaira(amount) {

        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }).format(amount);

    }


    // =================================
    // GET TRANSACTION DATE
    // =================================

    function getTransactionDate(transaction) {

        return (
            transaction.date ||
            transaction.transactionDate ||
            ""
        );

    }


    // =================================
    // GENERATE REPORT
    // =================================

    function generateReport() {

        const selectedStart =
            startDate.value;

        const selectedEnd =
            endDate.value;


        let filteredTransactions =
            [...transactions];


        // Filter by start date
        if (selectedStart) {

            filteredTransactions =
                filteredTransactions.filter(transaction => {

                    return getTransactionDate(transaction)
                        >= selectedStart;

                });

        }


        // Filter by end date
        if (selectedEnd) {

            filteredTransactions =
                filteredTransactions.filter(transaction => {

                    return getTransactionDate(transaction)
                        <= selectedEnd;

                });

        }


        // =================================
        // CALCULATE TOTALS
        // =================================

        let totalIncome = 0;
        let totalExpenses = 0;


        filteredTransactions.forEach(transaction => {

            const amount =
                Number(transaction.amount) || 0;

            const type =
                String(transaction.type || "")
                    .toLowerCase();


            if (type === "income") {

                totalIncome += amount;

            }


            if (type === "expense") {

                totalExpenses += amount;

            }

        });


        const balance =
            totalIncome - totalExpenses;


        // =================================
        // SUMMARY CARDS
        // =================================

        document.getElementById("total-income")
            .textContent =
            formatNaira(totalIncome);

        document.getElementById("total-expenses")
            .textContent =
            formatNaira(totalExpenses);

        document.getElementById("total-balance")
            .textContent =
            formatNaira(balance);


        // =================================
        // INCOME & EXPENSE REPORT
        // =================================

        document.getElementById("report-income")
            .textContent =
            formatNaira(totalIncome);

        document.getElementById("report-expenses")
            .textContent =
            formatNaira(totalExpenses);

        document.getElementById("report-balance")
            .textContent =
            formatNaira(balance);


        // =================================
        // SPENDING BY CATEGORY
        // =================================

        const categoryReport =
            document.getElementById("category-report");


        const categories = {};


        filteredTransactions.forEach(transaction => {

            const type =
                String(transaction.type || "")
                    .toLowerCase();


            if (type !== "expense") {
                return;
            }


            const category =
                transaction.category || "Other";


            const amount =
                Number(transaction.amount) || 0;


            if (!categories[category]) {
                categories[category] = 0;
            }


            categories[category] += amount;

        });


        categoryReport.innerHTML = "";


        const categoryNames =
            Object.keys(categories);


        if (categoryNames.length === 0) {

            categoryReport.innerHTML = `
                <p class="text-sm text-slate-500">
                    No expense data available.
                </p>
            `;

        } else {

            categoryNames
                .sort((a, b) =>
                    categories[b] - categories[a]
                )
                .forEach(category => {

                    const amount =
                        categories[category];


                    const percentage =
                        totalExpenses > 0
                            ? (amount / totalExpenses) * 100
                            : 0;


                    const item =
                        document.createElement("div");


                    item.innerHTML = `
                        <div class="flex items-center justify-between mb-1">

                            <span class="text-sm text-slate-600">
                                ${category}
                            </span>

                            <span class="text-sm font-semibold text-navy">
                                ${formatNaira(amount)}
                            </span>

                        </div>


                        <div class="w-full bg-slate-100 rounded-full h-2">

                            <div
                                class="bg-green h-2 rounded-full"
                                style="width: ${percentage}%"
                            ></div>

                        </div>


                        <p class="text-xs text-slate-400 mt-1">
                            ${percentage.toFixed(1)}%
                        </p>
                    `;


                    categoryReport.appendChild(item);

                });

        }


        // =================================
        // TRANSACTION SUMMARY
        // =================================

        const transactionSummary =
            document.getElementById(
                "transaction-summary"
            );


        transactionSummary.innerHTML = "";


        if (filteredTransactions.length === 0) {

            transactionSummary.innerHTML = `
                <p class="text-sm text-slate-500">
                    No transactions available.
                </p>
            `;

        } else {

            const incomeCount =
                filteredTransactions.filter(transaction =>
                    String(transaction.type || "")
                        .toLowerCase() === "income"
                ).length;


            const expenseCount =
                filteredTransactions.filter(transaction =>
                    String(transaction.type || "")
                        .toLowerCase() === "expense"
                ).length;


            transactionSummary.innerHTML = `

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div class="bg-slate-50 rounded-xl p-4">

                        <p class="text-sm text-slate-500">
                            Total Transactions
                        </p>

                        <p class="text-2xl font-bold text-navy mt-1">
                            ${filteredTransactions.length}
                        </p>

                    </div>


                    <div class="bg-green/10 rounded-xl p-4">

                        <p class="text-sm text-slate-500">
                            Income Entries
                        </p>

                        <p class="text-2xl font-bold text-green mt-1">
                            ${incomeCount}
                        </p>

                    </div>


                    <div class="bg-slate-50 rounded-xl p-4">

                        <p class="text-sm text-slate-500">
                            Expense Entries
                        </p>

                        <p class="text-2xl font-bold text-navy mt-1">
                            ${expenseCount}
                        </p>

                    </div>

                </div>
            `;

        }

    }


    // =================================
    // DATE FILTER
    // =================================

    startDate.addEventListener(
        "change",
        generateReport
    );

    endDate.addEventListener(
        "change",
        generateReport
    );


    // =================================
    // NAVIGATION
    // =================================

    document
        .getElementById("dashboard-link")
        .addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });


    document
        .getElementById("transactions-link")
        .addEventListener("click", () => {
            window.location.href = "transactions.html";
        });


    document
        .getElementById("budget-link")
        .addEventListener("click", () => {
            window.location.href = "budget.html";
        });


    document
        .getElementById("reports-link")
        .addEventListener("click", () => {
            window.location.href = "reports.html";
        });


    document
        .getElementById("profile-link")
        .addEventListener("click", () => {
            window.location.href = "profile.html";
        });


    document
        .getElementById("settings-link")
        .addEventListener("click", () => {
            window.location.href = "settings.html";
        });


    // =================================
    // LOGOUT
    // =================================

    document
        .getElementById("logout-link")
        .addEventListener("click", () => {

            localStorage.removeItem("cashbookUser");
            localStorage.removeItem("cashbookToken");
            window.location.href = "index.html";

        });


    // =================================
    // INITIAL REPORT
    // =================================

    loadTransactions();

});