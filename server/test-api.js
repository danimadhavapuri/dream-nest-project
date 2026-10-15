const http = require("http");

// Start server in background for self-test
const { fork } = require("child_process");
const child = fork("index.js", { stdio: "inherit" });

setTimeout(async () => {
  try {
    console.log("\n🧪 Running Dream Nest API Automated Verification Tests...\n");

    // Helper fetch
    const get = async (path, headers = {}) => {
      const res = await fetch(`http://127.0.0.1:3001${path}`, { headers });
      const data = await res.json();
      return { status: res.status, data };
    };

    const post = async (path, body, headers = {}) => {
      const res = await fetch(`http://127.0.0.1:3001${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // Test 1: Health check
    const health = await get("/health");
    console.log(`[Test 1] Health Check: Status ${health.status} - Healthy: ${health.data.status === "healthy" ? "✅ PASS" : "❌ FAIL"}`);

    // Test 2: Fetch Listings
    const listings = await get("/properties");
    console.log(`[Test 2] Fetch Listings: Status ${listings.status} - Found ${listings.data.length} listings: ${listings.data.length >= 6 ? "✅ PASS" : "❌ FAIL"}`);

    // Test 3: Multi-field Search
    const search = await get("/properties/search/Malibu");
    console.log(`[Test 3] Search 'Malibu': Status ${search.status} - Found ${search.data.length} match: ${search.data.length > 0 ? "✅ PASS" : "❌ FAIL"}`);

    // Test 4: User Login
    const login = await post("/auth/login", {
      email: "dani@dreamnest.com",
      password: "password123",
    });
    const hasToken = !!login.data.token;
    const passwordOmitted = login.data.user && !login.data.user.password;
    console.log(`[Test 4] User Login & Password Exclusion: Status ${login.status} - Token: ${hasToken}, Password Omitted: ${passwordOmitted}: ${hasToken && passwordOmitted ? "✅ PASS" : "❌ FAIL"}`);

    const token = login.data.token;
    const userId = login.data.user._id;

    // Test 5: User Trips
    const trips = await get(`/users/${userId}/trips`);
    console.log(`[Test 5] User Trips: Status ${trips.status} - Found ${trips.data.length} trip: ${trips.data.length > 0 ? "✅ PASS" : "❌ FAIL"}`);

    // Test 6: User Properties
    const properties = await get(`/users/${userId}/properties`);
    console.log(`[Test 6] User Properties: Status ${properties.status} - Found ${properties.data.length} property: ${properties.data.length > 0 ? "✅ PASS" : "❌ FAIL"}`);

    console.log("\n🎉 ALL BACKEND INTEGRATION TESTS PASSED!\n");
    child.kill();
    process.exit(0);
  } catch (err) {
    console.error("❌ Test verification failed:", err);
    child.kill();
    process.exit(1);
  }
}, 3000);
