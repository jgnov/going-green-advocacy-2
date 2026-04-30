#!/usr/bin/env node
/**
 * Build script: injects env vars from .env (or process.env) into index.html → dist/
 * Copies data/ (GeoJSON + council roster) into dist/data for static hosting.
 * Run: npm run build
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (_) {}

const ENV_VARS = [
  'EMAILJS_PUBLIC_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_ADMIN_TEMPLATE_ID',
  'EMAILJS_BCC_EMAIL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const root = path.join(__dirname);
const templatePath = path.join(root, 'index.html');
const adminPath = path.join(root, 'admin.html');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(templatePath)) {
  console.error('Missing index.html');
  process.exit(1);
}

const DEFAULTS = {
  EMAILJS_PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
  EMAILJS_SERVICE_ID: 'YOUR_SERVICE_ID',
  EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
  EMAILJS_ADMIN_TEMPLATE_ID: '',
  EMAILJS_BCC_EMAIL: '',
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
};
const replacements = {};
for (const key of ENV_VARS) {
  replacements[`__${key}__`] = process.env[key] || DEFAULTS[key] || '';
}

function injectEnv(html) {
  let out = html;
  for (const [placeholder, value] of Object.entries(replacements)) {
    out = out.split(placeholder).join(value);
  }
  return out;
}

function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, ent.name);
    if (ent.isDirectory()) copyDirRecursive(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

let indexHtml = fs.readFileSync(templatePath, 'utf8');
indexHtml = injectEnv(indexHtml);

let adminHtml = fs.readFileSync(adminPath, 'utf8');
adminHtml = injectEnv(adminHtml);

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(distDir, 'admin.html'), adminHtml);
fs.copyFileSync(path.join(root, 'CNAME'), path.join(distDir, 'CNAME'));

copyDirRecursive(path.join(root, 'data'), path.join(distDir, 'data'));

console.log('Build complete: dist/index.html, dist/admin.html, dist/data/');
