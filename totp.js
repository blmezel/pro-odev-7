const crypto = require('crypto');
const base32 = require('hi-base32');
const qrcode = require('qrcode-terminal');

// --- YARDIMCI FONKSİYONLAR ---
function generateSecret(length = 20) {
    const randomBuffer = crypto.randomBytes(length);
    return base32.encode(randomBuffer).replace(/=/g, '');
}

// RFC 6238 - TOTP Çekirdek Algoritması
function generateTOTP(secret, timeStep = 30) {
    // 1. Zamanı 30 saniyelik pencerelere böl (Time Step)
    const epoch = Math.floor(Date.now() / 1000);
    const timeCounter = Math.floor(epoch / timeStep);

    // 2. Zaman sayacını 8-byte'lık bir Buffer'a çevir
    const buffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
        buffer[i] = timeCounter & 0xff;
        timeCounter >> 8;
    }
    // Not: JavaScript bitwise işlemleri 32-bit sınırlı olduğu için büyük sayılarda buffer yazımı kritiktir.
    // Daha profesyonel olması için manuel buffer yazımı yaptık.
    const timeBuffer = Buffer.alloc(8);
    const bigIntTime = BigInt(Math.floor(Date.now() / 1000 / timeStep));
    timeBuffer.writeBigUInt64BE(bigIntTime);

    // 3. Gizli anahtarı (Secret) Base32'den geri çöz
    const key = base32.decode.asBytes(secret);

    // 4. HMAC-SHA1 hesapla (Algoritmanın kalbi)
    const hmac = crypto.createHmac('sha1', Buffer.from(key));
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    // 5. Dynamic Truncation (Dinamik Kırpma)
    // HMAC sonucunun son 4 bitini alıp ofset olarak kullanıyoruz
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code = (
        (hmacResult[offset] & 0x7f) << 24 |
        (hmacResult[offset + 1] & 0xff) << 16 |
        (hmacResult[offset + 2] & 0xff) << 8 |
        (hmacResult[offset + 3] & 0xff)
    );

    // 6. Sonucu 6 haneli yap (Modulo 1.000.000)
    const otp = code % 1000000;
    return otp.toString().padStart(6, '0');
}

// --- ANA ÇALIŞMA MANTIĞI ---
const issuer = "İstinye-Auth-Gates";
const account = "ezel@cybersec.isu";
// Sabit bir secret kullanalım ki her çalıştırdığında telefonla eşleşsin
// (Ya da her seferinde yeni üretilsin diyorsan generateSecret() kullanabilirsin)
const secret = "JBSWY3DPEHPK3PXP"; 

console.log("\n--- 🛡️ RFC 6238 TOTP DOĞRULAMA SİSTEMİ ---");
console.log(`🔑 Gizli Anahtar: ${secret}`);

// Her 1 saniyede bir ekranı güncelle ve kodları karşılaştır
setInterval(() => {
    const generatedOTP = generateTOTP(secret);
    
    // Terminali temizle ve yeni kodu bas
    process.stdout.write(`\r📱 Telefonundaki Kodla Karşılaştır: [ ${generatedOTP} ] | Kalan Süre: ${30 - (Math.floor(Date.now() / 1000) % 30)}s   `);
}, 1000);

// QR Kod için URI (Sadece ilk kurulumda lazım)
const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
// qrcode.generate(uri, { small: true }); // Telefonuna eklediysen burayı kapatabilirsin
