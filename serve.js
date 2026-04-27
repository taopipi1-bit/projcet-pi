/**
 * Life of Pi · 局域网静态服务
 * 用法：node serve.js
 *
 * - 零依赖（只用 Node 内置模块）
 * - 监听 0.0.0.0，自动打印所有局域网 IP
 * - 自动禁用浏览器缓存（每次刷新都拿最新文件）
 * - 默认服务当前目录的 Life_of_Pi.html
 */

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5173;
const ROOT = __dirname;
const DEFAULT_FILE = 'Life_of_Pi.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
};

function getLocalIPs() {
  const ips = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const it of ifs[name]) {
      if (it.family === 'IPv4' && !it.internal) ips.push(it.address);
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname === '/' || pathname === '') pathname = '/' + DEFAULT_FILE;

  // 防目录穿越
  const safePath = path.normalize(path.join(ROOT, pathname));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(safePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + pathname);
      log(req, 404);
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    // 关键：禁用所有缓存，确保手机刷新永远拿最新
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
    });
    fs.createReadStream(safePath).pipe(res);
    log(req, 200);
  });
});

function log(req, status) {
  const t = new Date().toTimeString().slice(0, 8);
  const ip = (req.socket.remoteAddress || '').replace('::ffff:', '');
  console.log(`[${t}] ${status}  ${req.method.padEnd(4)} ${req.url}  ← ${ip}`);
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  const bar = '─'.repeat(48);
  console.log('\n' + bar);
  console.log('  Life of Pi · 局域网服务已启动');
  console.log(bar);
  console.log('  本机：       http://localhost:' + PORT);
  if (ips.length === 0) {
    console.log('  (未检测到局域网 IP，请检查网络连接)');
  } else {
    ips.forEach(ip => {
      console.log('  手机/平板：  http://' + ip + ':' + PORT);
    });
  }
  console.log(bar);
  console.log('  • 手机和电脑须在同一 WiFi');
  console.log('  • 改完 HTML 直接手机刷新即可（已禁用缓存）');
  console.log('  • Ctrl+C 停止');
  console.log(bar + '\n');
});

// 防止首次运行时被防火墙拦截后僵死
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n端口 ${PORT} 已被占用。试试：PORT=5174 node serve.js\n`);
  } else {
    console.error('\n服务启动失败：', err.message, '\n');
  }
  process.exit(1);
});
