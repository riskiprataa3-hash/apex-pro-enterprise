import firebaseConfig from './firebase-applet-config.json' with { type: "json" };

async function createUser(email: string, pass: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, returnSecureToken: true })
  });
  const data = await res.json();
  if (data.error) {
    if (data.error.message === 'EMAIL_EXISTS') {
      console.log(`[SKIPPED] ${email} already exists.`);
    } else {
      console.error(`[ERROR] ${email}: ${data.error.message}`);
    }
  } else {
    console.log(`[SUCCESS] Created ${email}`);
  }
}

async function run() {
  console.log('Generating 15 Admin Accounts...');
  for (let i = 1; i <= 15; i++) {
    const num = i.toString().padStart(2, '0');
    await createUser(`admin.shaka${num}@gmail.com`, '02242004');
  }

  console.log('\nGenerating 50 Pelaksana Accounts...');
  for (let i = 1; i <= 50; i++) {
    const num = i.toString().padStart(2, '0');
    await createUser(`pelaksana.shaka${num}@gmail.com`, '02242004');
  }
}

run();
