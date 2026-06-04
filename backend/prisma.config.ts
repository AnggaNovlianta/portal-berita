import 'dotenv/config';

export default {
  datasource: {
    // Gunakan Environment Variable agar kredensial aman, dengan fallback untuk development
    url: process.env.DATABASE_URL || "mysql://portal_user:PasswordSuperAman123!@localhost:3306/portal_berita?allowPublicKeyRetrieval=true",
  }
};