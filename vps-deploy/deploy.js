const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('ssh2');

// 1. Parse local .env securely
const dotenvPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(dotenvPath)) {
  fs.readFileSync(dotenvPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const host = env.VPS_HOST;
const username = env.VPS_USER || 'root';
const password = env.VPS_PASS;

if (!host || !password) {
  console.error('❌ Error: VPS_HOST and VPS_PASS must be configured in your local .env file.');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const localTarPath = path.join(rootDir, 'dist.tar.gz');

console.log('🚀 Starting DentiLens Deployment Pipeline...');

try {
  // 2. Compile Expo Web App
  console.log('\n📦 Compiling production Expo Web bundle...');
  execSync('npx expo export --platform web', { cwd: rootDir, stdio: 'inherit' });

  // 3. Compress Build using Native Tar
  console.log('\n🗜️ Packaging production build into dist.tar.gz...');
  if (fs.existsSync(localTarPath)) fs.unlinkSync(localTarPath);
  execSync(`tar -czf dist.tar.gz -C dist .`, { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Packaging complete.');

} catch (error) {
  console.error('\n❌ Compilation or packaging failed:', error.message);
  process.exit(1);
}

// 4. SSH/SFTP Connection and Deployment
console.log(`\n🔌 Connecting to VPS: ${username}@${host}...`);
const conn = new Client();

conn.on('ready', () => {
  console.log('📶 SSH Connection established.');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ SFTP initialization failed:', err.message);
      conn.end();
      process.exit(1);
    }

    console.log('📁 SFTP Session started.');

    // Helper function to upload file
    const uploadFile = (localFile, remoteFile) => {
      return new Promise((resolve, reject) => {
        console.log(`📤 Uploading: ${path.basename(localFile)} ➡️ ${remoteFile}...`);
        sftp.fastPut(localFile, remoteFile, {}, (uploadErr) => {
          if (uploadErr) reject(uploadErr);
          else resolve();
        });
      });
    };

    // Run remote shell commands helper
    const execRemoteCommand = (cmd) => {
      return new Promise((resolve, reject) => {
        conn.exec(cmd, (execErr, stream) => {
          if (execErr) return reject(execErr);
          let stdout = '';
          let stderr = '';
          stream.on('close', (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`Command failed with code ${code}. Stderr: ${stderr}`));
          }).on('data', (data) => {
            stdout += data;
          }).stderr.on('data', (data) => {
            stderr += data;
          });
        });
      });
    };

    // Sequential deployment steps
    (async () => {
      try {
        console.log('📁 Creating remote directories on VPS...');
        await execRemoteCommand('mkdir -p /opt/dentilens/dist');

        // Upload assets
        await uploadFile(localTarPath, '/opt/dentilens/dist.tar.gz');
        await uploadFile(path.join(__dirname, 'nginx.conf'), '/opt/dentilens/nginx.conf');
        await uploadFile(path.join(__dirname, 'docker-compose.yml'), '/opt/dentilens/docker-compose.yml');

        console.log('\n🧹 Clearing remote dist directory and extracting build...');
        await execRemoteCommand('rm -rf /opt/dentilens/dist/*');
        await execRemoteCommand('tar -xzf /opt/dentilens/dist.tar.gz -C /opt/dentilens/dist');
        await execRemoteCommand('rm /opt/dentilens/dist.tar.gz');
        console.log('✅ Remote build extraction complete.');

        console.log('\n🚢 Starting standalone Docker Compose stack for DentiLens on VPS...');
        const composeOutput = await execRemoteCommand('docker compose -f /opt/dentilens/docker-compose.yml up -d --remove-orphans');
        console.log(composeOutput);

        console.log('\n♻️ Reloading Nginx service on VPS...');
        await execRemoteCommand('docker exec dentilens-nginx nginx -s reload || true');

        console.log('\n🎉 SUCCESS! DentiLens has been successfully deployed to your VPS.');
        console.log(`🌐 Live URL: https://${host} (and https://lifora.fun)`);

      } catch (deployErr) {
        console.error('\n❌ Deployment step failed:', deployErr.message);
      } finally {
        // Local cleanup of temporary tarball
        if (fs.existsSync(localTarPath)) {
          fs.unlinkSync(localTarPath);
        }
        conn.end();
      }
    })();
  });
}).on('error', (sshErr) => {
  console.error('❌ SSH Connection failed:', sshErr.message);
}).connect({
  host,
  port: 22,
  username,
  password,
  readyTimeout: 30000
});
