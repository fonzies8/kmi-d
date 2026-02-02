(function () {
    "use strict";

    function addResult(title, data, type) {
        type = type || "info";
        const resultsDiv = document.getElementById("testResults");
        if (!resultsDiv) {
            console.error("testResults div not found!");
            return;
        }
        const timestamp = new Date().toLocaleString("tr-TR");

        const alertClassMap = {
            "success": "alert-success",
            "error": "alert-danger",
            "warning": "alert-warning",
            "info": "alert-info"
        };
        const alertClass = alertClassMap[type] || "alert-info";

        const jsonData = JSON.stringify(data, null, 2);
        let resultHtml = '<div class="alert ' + alertClass + ' mb-3">';
        resultHtml += '<h6><i class="fas fa-check-circle"></i> ' + title + '</h6>';
        resultHtml += '<small class="text-muted">' + timestamp + '</small>';
        resultHtml += '<pre class="mt-2 mb-0" style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">' + jsonData + '</pre>';
        resultHtml += '</div>';

        if (resultsDiv.innerHTML.includes("Test sonuçları burada görünecek")) {
            resultsDiv.innerHTML = resultHtml;
        } else {
            resultsDiv.innerHTML = resultHtml + resultsDiv.innerHTML;
        }
    }

    function clearResults() {
        const resultsDiv = document.getElementById("testResults");
        if (resultsDiv) {
            resultsDiv.innerHTML = '<p class="text-muted text-center">Test sonuçları burada görünecek...</p>';
        }
    }

    async function testDatabase() {
        try {
            addResult("Veritabanı Bağlantısı Test Ediliyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/database", {
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error("Unexpected response format: " + text.substring(0, 100));
            }

            const data = await response.json();
            addResult("Veritabanı Bağlantısı", data, data.success ? "success" : "error");
        } catch (error) {
            console.error("testDatabase error:", error);
            addResult("Veritabanı Bağlantısı Hatası", { error: error.message }, "error");
        }
    }

    async function testProducts() {
        try {
            addResult("Ürünler Test Ediliyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/products", {
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();
            addResult("Ürünler Test Sonucu", data, data.success ? "success" : "error");
        } catch (error) {
            console.error("testProducts error:", error);
            addResult("Ürünler Test Hatası", { error: error.message }, "error");
        }
    }

    async function testServices() {
        try {
            addResult("Hizmetler Test Ediliyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/services", {
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();
            addResult("Hizmetler Test Sonucu", data, data.success ? "success" : "error");
        } catch (error) {
            console.error("testServices error:", error);
            addResult("Hizmetler Test Hatası", { error: error.message }, "error");
        }
    }

    async function testSession() {
        try {
            addResult("Session Bilgisi Alınıyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/session", {
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();
            addResult("Session Bilgisi", data, data.success ? "success" : "error");
        } catch (error) {
            console.error("testSession error:", error);
            addResult("Session Test Hatası", { error: error.message }, "error");
        }
    }

    async function createTestProduct() {
        if (!confirm("Test ürünü oluşturulsun mu?")) return;

        try {
            addResult("Test Ürünü Oluşturuluyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/create-product", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();
            addResult("Test Ürünü Oluşturuldu", data, data.success ? "success" : "error");

            if (data.success) {
                setTimeout(function () { testProducts(); }, 1000);
            }
        } catch (error) {
            console.error("createTestProduct error:", error);
            addResult("Test Ürünü Oluşturma Hatası", { error: error.message }, "error");
        }
    }

    async function createTestService() {
        if (!confirm("Test hizmeti oluşturulsun mu?")) return;

        try {
            addResult("Test Hizmeti Oluşturuluyor...", { status: "loading" }, "info");

            const response = await fetch("/admin/api/test/create-service", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();
            addResult("Test Hizmeti Oluşturuldu", data, data.success ? "success" : "error");

            if (data.success) {
                setTimeout(function () { testServices(); }, 1000);
            }
        } catch (error) {
            console.error("createTestService error:", error);
            addResult("Test Hizmeti Oluşturma Hatası", { error: error.message }, "error");
        }
    }

    const sqlExamples = {
        SELECT: "SELECT * FROM products ORDER BY created_at DESC LIMIT 10;",
        INSERT: "INSERT INTO products (name, description, category, status, display_order) VALUES ('Yeni Ürün', 'Bu bir test ürünüdür', 'Test', 'active', 0) RETURNING *;",
        UPDATE: "UPDATE products SET name = 'Güncellenmiş Ürün Adı', description = 'Güncellenmiş açıklama' WHERE id = 1 RETURNING *;",
        DELETE: "DELETE FROM products WHERE id = (SELECT MAX(id) FROM products) RETURNING *;",
        COUNT: "SELECT (SELECT COUNT(*) FROM products) as product_count, (SELECT COUNT(*) FROM services) as service_count, (SELECT COUNT(*) FROM users) as user_count, (SELECT COUNT(*) FROM homepage_cards) as card_count;",
        JOIN: "SELECT p.id, p.name, p.category, COUNT(pi.id) as image_count FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id GROUP BY p.id, p.name, p.category ORDER BY p.created_at DESC LIMIT 10;"
    };

    function loadSQLExample(exampleType) {
        const sqlQueryTextarea = document.getElementById("sqlQuery");
        if (!sqlQueryTextarea) return;
        if (!sqlExamples[exampleType]) return;
        sqlQueryTextarea.value = sqlExamples[exampleType];
        sqlQueryTextarea.focus();
    }

    async function executeSQL() {
        const sqlQueryTextarea = document.getElementById("sqlQuery");
        const query = sqlQueryTextarea ? sqlQueryTextarea.value.trim() : "";

        if (!query) {
            alert("Lütfen bir SQL sorgusu girin!");
            return;
        }

        const trimmedQuery = query.toUpperCase().trim();
        if (!trimmedQuery.startsWith("SELECT")) {
            if (!confirm("Bu sorgu veritabanını değiştirebilir. Devam etmek istediğinizden emin misiniz?")) {
                return;
            }
        }

        try {
            addResult("SQL Sorgusu Çalıştırılıyor...", { query: query.substring(0, 200) }, "info");

            const response = await fetch("/admin/api/test/execute-sql", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("HTTP " + response.status + ": " + errorText);
            }

            const data = await response.json();

            if (data.success) {
                const resultData = {
                    query: data.query,
                    queryType: data.queryType,
                    rowCount: data.rowCount,
                    executionTime: data.executionTime,
                    result: data.result,
                    timestamp: data.timestamp
                };
                addResult("SQL Sorgusu Başarılı", resultData, "success");
            } else {
                addResult("SQL Sorgusu Hatası", data, "error");
            }
        } catch (error) {
            console.error("executeSQL error:", error);
            addResult("SQL Sorgusu Hatası", {
                error: error.message,
                query: query.substring(0, 200)
            }, "error");
        }
    }

    function clearSQL() {
        const sqlQueryTextarea = document.getElementById("sqlQuery");
        if (sqlQueryTextarea) {
            sqlQueryTextarea.value = "";
            sqlQueryTextarea.focus();
        }
    }

    function initializeEventListeners() {
        const testDbBtn = document.getElementById("testDbBtn");
        const testProductsBtn = document.getElementById("testProductsBtn");
        const testServicesBtn = document.getElementById("testServicesBtn");
        const testSessionBtn = document.getElementById("testSessionBtn");
        const createTestProductBtn = document.getElementById("createTestProductBtn");
        const createTestServiceBtn = document.getElementById("createTestServiceBtn");
        const clearResultsBtn = document.getElementById("clearResultsBtn");
        const executeSQLBtn = document.getElementById("executeSQLBtn");
        const clearSQLBtn = document.getElementById("clearSQLBtn");
        const sqlExampleBtns = document.querySelectorAll(".sql-example-btn");

        if (testDbBtn) testDbBtn.addEventListener("click", testDatabase);
        if (testProductsBtn) testProductsBtn.addEventListener("click", testProducts);
        if (testServicesBtn) testServicesBtn.addEventListener("click", testServices);
        if (testSessionBtn) testSessionBtn.addEventListener("click", testSession);
        if (createTestProductBtn) createTestProductBtn.addEventListener("click", createTestProduct);
        if (createTestServiceBtn) createTestServiceBtn.addEventListener("click", createTestService);
        if (clearResultsBtn) clearResultsBtn.addEventListener("click", clearResults);
        if (executeSQLBtn) {
            executeSQLBtn.addEventListener("click", function (e) {
                e.preventDefault();
                executeSQL();
            });
        }
        if (clearSQLBtn) {
            clearSQLBtn.addEventListener("click", function (e) {
                e.preventDefault();
                clearSQL();
            });
        }
        if (sqlExampleBtns && sqlExampleBtns.length > 0) {
            sqlExampleBtns.forEach(function (btn) {
                btn.addEventListener("click", function (e) {
                    e.preventDefault();
                    const exampleType = this.getAttribute("data-example");
                    loadSQLExample(exampleType);
                });
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeEventListeners);
    } else {
        initializeEventListeners();
    }
})();
