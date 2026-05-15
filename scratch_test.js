const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);

if (urlMatch && keyMatch) {
  const url = urlMatch[1].replace(/"/g, '').replace(/'/g, '');
  const key = keyMatch[1].replace(/"/g, '').replace(/'/g, '');
  fetch(url + '/rest/v1/roles?select=*', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  }).then(r => r.json()).then(data => {
    console.log('user_roles:', data);
  }).catch(e => console.error(e));
} else {
  console.log('Env variables not found');
}
