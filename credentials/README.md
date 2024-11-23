# Credentials

## AWS Console Credentials

**username:** `gdsd-team-3`

**email:** `muhammad-zaid.akhter@informatik.hs-fulda.de`

**password:** `GDSD_3_smhaz`

## EC2 Credentials Mac

1. Download `team-3-openssh.pem` file,
2. Open an SSH client.
3. Locate your private key file. The key used to launch this instance is `team-3-openssh.pem`
4. Run this command, if necessary, to ensure your key is not publicly viewable. `chmod 400 "team-3-openssh.pem"`
5. Connect to your instance using its Public DNS:
   `ssh -i "team-3-openssh.pem" ubuntu@ec2-3-76-41-200.eu-central-1.compute.amazonaws.com`

## EC2 Credentials Windows

1. Connecting to the public DNS of the instance using the \*.ppk file.
2. Use:
   - **user**: `ubuntu`
   - **dns**: `ec2-3-76-41-200.eu-central-1.compute.amazonaws.com`

## Database

**url:** `jdbc:mysql://gdsd.clau0k8881i1.eu-central-1.rds.amazonaws.com:3306/`

**username:** `admin`

**password:** `gdsd_3_smhaz`

**database:** `gdsd`

## Manual deployment

Steps to deploy manually:

1. ssh into the server
2. `cd ~/gdsd`
3. `git pull origin main`
4. update the `.env` file
5. `npm install`
6. `npm run build`
7. `npm run db:migrate`
8. `pm2 restart gdsd`

# Project Setup

## Prerequisites

1. **NodeJS v20:** Install from https://nodejs.org/en/download/prebuilt-installer

2. **MySQL v8:** Install either from [mysql.com](https://dev.mysql.com/downloads/) or for an easy setup use
   [DBngin](https://dbngin.com/)

## Running the project

Steps to run the project on your local machine:

1. Clone the repository
2. Make sure mysql is running on your machine and create a database named `gdsd`
3. Create a `.env` file in the root directory of the project and add the following environment variables:

```
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:@localhost:3306/gdsd"
```

**Note:** The database URL should be in the format `mysql://username:password@host:port/database`. Modify the values
according to your database setup.

2. Run `npm run setup`. This will install all dependencies for backend and frontend, create the database and run the
   seed scripts.
3. Run `npm run dev` to start the project in development mode. This will start the backend server on port 3000 and the
   frontend server on port 5173.
4. Open `http://localhost:5173` in your browser to view the project

## Additional Links

1. **Nginx Setup Guide:**
   [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04)

2. **PuTTy (for Windows):**
   - Go to the official PuTTY download page.
   - Download the appropriate installer for your system.
   - Run the installer and follow the installation instructions.

```

```
