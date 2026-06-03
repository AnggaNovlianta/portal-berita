"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    datasource: {
        // Gunakan Environment Variable agar kredensial aman, dengan fallback untuk development
        url: process.env.DATABASE_URL || "mysql://root:@localhost:3306/portal_berita",
    }
};
