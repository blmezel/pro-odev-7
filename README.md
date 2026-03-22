cat << 'EOF' > README.md
# 🛡️ Interactive MFA Lab: RFC 6238 TOTP Engine & Security Analysis

<div align="center">
  <img src="https://img.shields.io/badge/Security_Level-Enterprise-gold?style=for-the-badge" alt="Security"/>
  <img src="https://img.shields.io/badge/Protocol-RFC_6238-blue?style=for-the-badge" alt="RFC 6238"/>
  <img src="https://img.shields.io/badge/Standard-FIPS_180--4-red?style=for-the-badge" alt="SHA1"/>
</div>

<br/>

> **Araştırmacı:** Ezel Balım Atik  
> **Kurum:** İstinye Üniversitesi - Bilgi Güvenliği Teknolojisi  
> **Proje:** Ödev #7 - Çok Faktörlü Kimlik Doğrulama (2FA) ve TOTP Algoritma Mimarisi  

---

## 🎯 Proje Vizyonu

Bu çalışma, modern siber güvenlik mimarilerinin vazgeçilmez bir parçası olan **Zamana Dayalı Tek Kullanımlık Şifre (TOTP)** sisteminin teorik ve pratik analizini sunar. Projenin temel amacı, üçüncü taraf kütüphanelere bağımlı kalmadan, **IETF RFC 6238** standartlarını Node.js ortamında "low-level" (alt seviye) kodlayarak bir kimlik doğrulama motoru inşa etmektir.

---

## 🧬 Algoritma ve Matematiksel Temel

TOTP algoritması, özünde **HOTP (HMAC-based One-Time Password)** algoritmasının zaman damgasıyla ($T$) beslenmiş halidir. Sistem şu matematiksel modele dayanır:

### 1. Zaman Adımı (Time Step) Hesaplaması
Sistem, Unix Epoch zamanını ($T_{0}$) baz alarak 30 saniyelik pencereler ($X$) oluşturur:
$$T = \lfloor (CurrentUnixTime - T0) / X \rfloor$$

### 2. HMAC-SHA1 ve Dinamik Kırpma (Dynamic Truncation)
Üretilen 6 haneli kod, gizli anahtar ($K$) ve zaman sayacının ($T$) birleşiminden türetilir:
$$TOTP(K, T) = Truncate(HMAC-SHA1(K, T)) \pmod{10^6}$$



---

## 🛠️ Teknik Özellikler ve Implementasyon

### 🔐 Kriptografik Güvenlik (Secret Provisioning)
- **Base32 Encoding:** Gizli anahtarlar (Secret), insan tarafından okunabilirliği artırmak ve Google Authenticator/Authy gibi uygulamalarla tam uyum sağlamak için RFC 4648 standartlarında Base32 ile kodlanmıştır.
- **Node.js Crypto Module:** HMAC hesaplamaları için donanım seviyesinde optimize edilmiş `crypto` kütüphanesi kullanılarak veri bütünlüğü (Data Integrity) sağlanmıştır.

### 📱 İnteraktif QR Entegrasyonu
- **otpauth:// URI:** Sistem, üretilen anahtarı otomatik olarak bir URI şemasına dönüştürür. 
- **Terminal Rendering:** Kullanıcının manuel giriş yapmasına gerek kalmadan, terminal içerisinde taranabilir **High-Density QR Kod** üretimi gerçekleştirilmiştir.

### ⏳ Senkronizasyon ve Tolerans Mekanizması (Clock Drift)
Sunucu ve mobil cihaz arasındaki zaman kaymalarını ($\Delta t$) önlemek adına sistem **$\pm 1$ adım (90 saniyelik pencere)** toleransıyla çalışır:
- $[T-1]$ : Geçmiş 30 saniye
- $[T]$   : Mevcut an
- $[T+1]$ : Gelecek 30 saniye (Ağ gecikmeleri için)

---

## 🕵️‍♂️ Derinlemesine Güvenlik ve Bypass Analizi

Proje kapsamında TOTP sistemlerine yönelik olası saldırı vektörleri incelenmiş ve çözüm önerileri geliştirilmiştir:

| Saldırı Vektörü | Açıklama | Savunma Stratejisi |
| :--- | :--- | :--- |
| **AiTM (Adversary-in-the-Middle)** | Saldırganın gerçek zamanlı bir proxy kurarak kodu çalması. | FIDO2/WebAuthn entegrasyonu. |
| **Brute Force** | 1.000.000 kombinasyonun saniyeler içinde denenmesi. | Rate Limiting ve Account Lockout politikaları. |
| **Secret Exfiltration** | Cihazdaki gizli anahtarın (Seed) zararlı yazılımla çalınması. | HSM (Hardware Security Module) kullanımı. |
| **Social Engineering** | Kullanıcının kodu telefonla saldırgana söylemesi. | MFA yorgunluğu (Fatigue) saldırılarına karşı kullanıcı eğitimi. |

---

## 🚀 Kurulum ve Test Protokolü

Sistemi laboratuvar ortamında test etmek için:

1. **Bağımlılıklar:** `npm install qrcode-terminal hi-base32`
2. **Başlatma:** `node totp.js`
3. **Eşleşme:** Terminalde üretilen kodu Google Authenticator'daki çıktı ile saniye bazlı karşılaştırın.

---
*İstinye Üniversitesi - Bilgi Güvenliği Teknolojisi Bölümü Laboratuvar Raporu*
EOF
