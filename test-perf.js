
async function testPerformance() {
  const start = Date.now();
  const res = await fetch('http://localhost:3000/api/logs?days=120');
  const data = await res.json();
  const end = Date.now();
  console.log(`API response time: ${end - start}ms`);
  console.log(`Logs count: ${data.logs.length}`);
}

testPerformance().catch(console.error);
