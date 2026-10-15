const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'assets', 'nongsan');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const assets = [
  {
    filename: 'buoi-duong-la-cam.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pomelo_fruit.jpg?width=800',
    title: 'Bưởi Đường Lá Cam (Citrus maxima)',
    author: 'Iifar',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pomelo_fruit.jpg',
    species: 'Citrus maxima',
    attribution: 'Ảnh loài Citrus maxima bởi tác giả Iifar (Wikimedia Commons, CC BY-SA 4.0)'
  },
  {
    filename: 'buoi-da-xanh-tantrieu.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pomelo_flesh.jpg?width=800',
    title: 'Múi bưởi mọng nước (Citrus maxima flesh)',
    author: 'Iifar',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pomelo_flesh.jpg',
    species: 'Citrus maxima',
    attribution: 'Ảnh tép bưởi Citrus maxima bởi tác giả Iifar (Wikimedia Commons, CC BY-SA 4.0)'
  },
  {
    filename: 'sau-rieng-ri6-longkhanh.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Owoce_Durian.jpg?width=800',
    title: 'Trái sầu riêng chín cây (Durio zibethinus)',
    author: 'Nova',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Owoce_Durian.jpg',
    species: 'Durio zibethinus',
    attribution: 'Ảnh trái sầu riêng Durio zibethinus bởi tác giả Nova (Wikimedia Commons, CC BY-SA 3.0)'
  },
  {
    filename: 'chom-chom-nhan-longkhanh.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rambutans_with_seed.jpg?width=800',
    title: 'Chôm chôm nhãn giòn ngọt (Nephelium lappaceum)',
    author: 'Iifar',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rambutans_with_seed.jpg',
    species: 'Nephelium lappaceum',
    attribution: 'Ảnh chôm chôm Nephelium lappaceum bởi tác giả Iifar (Wikimedia Commons, CC BY-SA 4.0)'
  },
  {
    filename: 'hat-dieu-rang-cui.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Roasted_Cashew_Nuts_(52746470588).jpg?width=800',
    title: 'Hạt điều rang củi vỏ lụa (Anacardium occidentale)',
    author: 'TaurusEmerald',
    license: 'CC BY 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roasted_Cashew_Nuts_(52746470588).jpg',
    species: 'Anacardium occidentale',
    attribution: 'Ảnh hạt điều rang củi bởi tác giả TaurusEmerald (Wikimedia Commons, CC BY 2.0)'
  },
  {
    filename: 'tieu-den-xuanloc.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_peppercorns_gn.jpg?width=800',
    title: 'Hạt tiêu đen khô (Piper nigrum)',
    author: 'Gnangcomapp',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Black_peppercorns_gn.jpg',
    species: 'Piper nigrum',
    attribution: 'Ảnh hạt tiêu đen Piper nigrum bởi tác giả Gnangcomapp (Wikimedia Commons, CC BY-SA 4.0)'
  }
];

async function downloadAsset(item) {
  const filePath = path.join(targetDir, item.filename);
  console.log(`Downloading optimized 800px ${item.filename}...`);
  try {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'CropNetBot/1.0 (https://cropnetkhoaduc.vercel.app; info@cropnet.vn)'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    console.log(`✓ Saved ${item.filename} (${arrayBuffer.byteLength} bytes)`);
  } catch (err) {
    console.error(`✗ Failed downloading ${item.filename}:`, err.message);
  }
}

function createSvgPlaceholder() {
  const svgPath = path.join(targetDir, 'placeholder-nongsan.svg');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" fill="#F4F2EC"/>
  <rect x="20" y="20" width="360" height="360" rx="16" fill="#FAF9F5" stroke="#CBD0C4" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="200" cy="170" r="50" fill="#E6EAE4"/>
  <path d="M200 145 C185 130 160 145 160 170 C160 195 200 215 200 215 C200 215 240 195 240 170 C240 145 215 130 200 145 Z" fill="#2C4939" opacity="0.85"/>
  <circle cx="200" cy="170" r="14" fill="#EAE7DC"/>
  <text x="200" y="255" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#253129">Hồ Sơ Nông Sản Đồng Nai</text>
  <text x="200" y="278" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#758277">Ảnh thực địa HTX đang được số hóa</text>
  <rect x="120" y="300" width="160" height="26" rx="13" fill="#E6EAE4"/>
  <text x="200" y="317" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#2C4939">Xác Minh Pháp Lý HTX</text>
</svg>`;
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log(`✓ Created placeholder-nongsan.svg`);
}

async function run() {
  createSvgPlaceholder();
  for (const item of assets) {
    await downloadAsset(item);
  }
  console.log('Optimized assets download complete.');
}

run();
