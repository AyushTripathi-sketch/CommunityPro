# CommunityPro
A SaaS Platform that enables user to make their communities and add members to it.

## Tech Stack
1. Database - MySQl
2. ORM - Sequelize
3. Authentication - JWT
4. Backend - Node, Express
 
## Project Setup
1. Clone the repository
2. Run ```npm i``` to install all the dependencies.
3. Create a database in mysql workbench.
4. Create a ".env" file in the root of the repo. Add following lines to the file.

```bash
JWT_SECRET =  "<Your Secret Key>"
PORT = <Port Number>
DEVELOPMENT_DATABASE_URL = "mysql://localhost:3306/<database name>?user=<username>&password=<password>"
```

## Usage
You can use Postman to call different APIs.
