require("dotenv").config();

async function testController() {
  try {
    console.log("Testing statistics controller...");
    
    const { getDashboardOverview } = require("./controllers/statistics.controller");
    
    // Mock request and response
    const mockReq = {
      query: {}
    };
    
    const mockRes = {
      json: (data) => {
        console.log("✅ Controller response:", JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Controller error (${code}):`, JSON.stringify(data, null, 2));
        }
      })
    };
    
    console.log("Calling getDashboardOverview...");
    await getDashboardOverview(mockReq, mockRes);
    
  } catch (error) {
    console.error("❌ Controller test failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

testController();
