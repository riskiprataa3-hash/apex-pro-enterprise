fetch('http://localhost:3000/api/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataSnippet: [], totalEntries: 0 })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
