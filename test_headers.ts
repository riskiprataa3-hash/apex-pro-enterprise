import fetch from "node-fetch";

async function testFetch() {
  const url = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG_20260515_093939_861.jpg?alt=media&token=d61610e3-511a-40a0-b272-b12f6536c9be";
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Headers:", res.headers.raw());
}
testFetch();
