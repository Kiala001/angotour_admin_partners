// Quick Test Script for Partner Data Loading
// Copy and paste this in DevTools Console to test partner data loading

console.log("======================================")
console.log("Partner Data Loading - Quick Test")
console.log("======================================")

// Step 1: Check localStorage
console.log("\n1. Checking localStorage...")
const authData = localStorage.getItem('angotour_auth')
if (authData) {
  const user = JSON.parse(authData)
  console.log("✓ Auth data found:", user)
  const partnerId = user.id
  
  // Step 2: Test API call
  console.log("\n2. Testing API call to /api/partners/" + partnerId)
  fetch(`/api/partners/${partnerId}`)
    .then(res => {
      console.log("   Response status:", res.status)
      return res.json()
    })
    .then(data => {
      if (data.id) {
        console.log("✓ Partner loaded successfully!")
        console.log("   ID:", data.id)
        console.log("   Company:", data.companyName)
        console.log("   Type:", data.type)
        console.log("   Documents:", data.documents?.length || 0)
      } else {
        console.log("✗ Error:", data.error)
      }
    })
    .catch(err => {
      console.log("✗ Request failed:", err.message)
    })
} else {
  console.log("✗ No auth data found in localStorage")
  console.log("   Please login first")
}

console.log("\n3. Wait a few seconds for API response...")
