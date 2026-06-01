export default {
  datasource: {
    // Gunakan Environment Variable agar kredensial aman, dengan fallback untuk development
    url: process.env.DATABASE_URL || "postgresql://postgres:adminsupersu@localhost:5432/portal_berita?schema=public",
  }
};