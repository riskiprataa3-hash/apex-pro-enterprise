import fetch from "node-fetch";

async function testFetch() {
  const url = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%200%25%2F21%2B800.jpg?alt=media";
  const res = await fetch(url);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 100));
}
testFetch();
