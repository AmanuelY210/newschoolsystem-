# MySQL + phpMyAdmin Setup Guide

## Step 1: Install MySQL & phpMyAdmin

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server phpmyadmin php-mysql
```

### On Windows (XAMPP):
Download XAMPP from https://www.apachefriends.org/
- XAMPP includes MySQL + phpMyAdmin

### On Mac (MAMP):
Download MAMP from https://www.mamp.info/

## Step 2: Import Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "Import" tab
3. Choose file: `school_management_mysql.sql`
4. Click "Go" to import

This creates the `school_management` database with all 41 tables and data.

## Step 3: Update .env

Edit `.env` file:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/school_management"
```

## Step 4: Update Prisma Schema

In `prisma/schema.prisma`, change:
```
datasource db {
  provider = "mysql"  // was "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 5: Run the Application

```bash
bun install
bun run db:push
bun run prisma/seed.ts
bun run dev
```

## Database Info
- Database name: school_management
- Tables: 41
- Includes: Users, Students, Teachers, Marks, Attendance, Finance, Library, CMS, Academic Tools, etc.

## Default Login Credentials
- Super Admin: superadmin@school.edu / password123
- Admin: admin@school.edu / password123
- Teacher: teacher@school.edu / password123
- Student: student@school.edu / password123
- Finance: finance@school.edu / password123
- Library: library@school.edu / password123
