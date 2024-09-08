# simple-product-api-mysql

This project is a Node.js application that provides a RESTful API for managing product details using MySQL as the database. It allows you to create, read, update, and delete product records.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
  - [Manual Setup](#manual-setup)
  - [Docker Setup](#docker-setup)
  - [Docker Setup Using Docker Hub Repositories](#docker-setup-using-docker-hub-repositories)
- [Endpoints](#endpoints)
- [Database Schema](#database-schema)
  - [SQL Schema Creation Script](#sql-schema-creation-script)   

## Features

- **Create**: Add new products with details.
- **Read**: Fetch all products or a single product by ID.
- **Update**: Modify product details.
- **Delete**: Remove a product by ID.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **Validation**: express-validator
- **Environment Management**: dotenv
- **Database Pooling**: mysql2

## Installation

### Manual Setup

1. **Clone the Repository**
   
   ```sh
   git clone https://github.com/broaditya/simple-product-api-mysql.git
   cd simple-product-api-mysql
   ```
3. **Install Dependencies**
   
   ```sh
   npm install
   ```
4. **Set Up Environment Variables**
   
   Create `.env` file: Set up your environment variables as follows:
   ```sh
    DB_HOST=<your-database-host>
    DB_USER=<your-database-username>
    DB_PASSWORD=<your-database-password>
    DB_NAME=<your-database-name>
    DB_PORT=<your-database-port>
   ```
5. **Create the Database and Table**
   
   You can run the SQL commands to set up your database schema. Create a file named `init.sql` with the following content:
   ```sh
    CREATE DATABASE IF NOT EXISTS simple_task;

    USE simple_task;

    CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,        
        product_name VARCHAR(255) NOT NULL,            
        product_description TEXT DEFAULT NULL,                       
        product_price DECIMAL(10, 2) NOT NULL,     
        product_variety VARCHAR(255) DEFAULT NULL,                    
        product_rating DECIMAL(2, 1) DEFAULT NULL CHECK (product_rating >= 0 AND product_rating <= 5), 
        product_stock INT NOT NULL,                 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
    );
   ```
   Execute these commands using your MySQL client.
   
6. Run the Application:
   ```sh
    node .\index.js
   ```
### Docker Setup
1. **Clone the Repository**
   ```sh
   git clone https://github.com/broaditya/simple-product-api-mysql.git
   cd simple-product-api-mysql
   ```
2. **Create Docker Images**
   
   Ensure you have `Dockerfile` and `docker-compose.yml` files in the root directory of your project.
   
   Dockerfile:
   ```sh
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["node", "index.js"]
   ```

     docker-compose.yml:
   ```sh
    version: '3.8'

    services:
      mysql:
        image: mysql:8.0
        ports:
          - "3306:3306"
        environment:
          MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
          MYSQL_DATABASE: simple_task
        volumes:
          - ./init.sql:/docker-entrypoint-initdb.d/init.sql

      node-app:
        build:
          context: .
          dockerfile: Dockerfile
        ports:
          - "3000:3000"
        environment:
          - DB_HOST=mysql
          - DB_USER=root
          - DB_PASSWORD=
          - DB_NAME=simple_task
        depends_on:
          - mysql
        restart: always
   ```
3.  Build and Start Containers
   ```sh
    docker-compose up --build
   ```
The application will be available at http://localhost:3000, and MySQL will be available at mysql:3306.

### Docker Setup Using Docker Hub Repositories
1. **Clone the Repository**
   ```sh
   git clone https://github.com/broaditya/simple-product-api-mysql.git
   cd simple-product-api-mysql
   ```
2. **Create Docker Images**
   
   Ensure you have `Dockerfile` and `docker-compose-pull.yml` files in the root directory of your project.
   
   Dockerfile:
   ```sh
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["node", "index.js"]
   ```

     docker-compose-pull.yml:
   ```sh
    version: '3.8'

    services:
      mysql:
        image: mysql:8.0
        ports:
          - "3306:3306"
        environment:
          MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
          MYSQL_DATABASE: simple_task
        volumes:
          - ./init.sql:/docker-entrypoint-initdb.d/init.sql

      node-app:
        image: broaditya/simple-product-api-mysql-node-app
        ports:
          - "3000:3000"
        environment:
          - DB_HOST=mysql
          - DB_USER=root
          - DB_PASSWORD=
          - DB_NAME=simple_task
        depends_on:
          - mysql
        restart: always
   ```
3.  Build and Start Containers
   ```sh
     docker-compose -f docker-compose-pull.yml up --build
   ```
The application will be available at http://localhost:3000, and MySQL will be available at mysql:3306.

## Endpoints
* **POST /products** : Create a new product.
  
| Method        | POST           | 
|---------------------|----------------------|
| URL       | /products              |
| Path Parameters    |-       | 
|Request Body Type | JSON             |
| Request Body    | { "name": "Product Name", "description": "Product Description", "price": 99.99, "variety": "Size, Color", "rating": 4.5, "stock": 100 }    |
| Response (201 Created)   | { "product_name": "Laptop SNSV", "product_description": "Laptop dengan spesifikasi tinggi", "product_price": 10.00, "product_variety": "Gaming", "product_rating": 4.5, "product_stock": 10 }   |
| Error (400 Bad Request)  | { "errors": [ { "msg": "Product name is required", "param": "product_name", "location": "body" }, { "msg": "Price must be a non-negative number", "param": "product_price", "location": "body" }, { "msg": "Stock must be a non-negative integer", "param": "product_stock", "location": "body" } ] }  | 
| Error (500 Internal Server Error)   |{ "error": "Database error: [error message]" }             | 

* **GET /products** : Get all products.

| Method        | GET           | 
|---------------------|----------------------|
| URL       | /products              |
| Path Parameters    |-       | 
|Request Body Type | -            |
| Request Body    | -  |
| Response (200 OK)   | [ { "product_id": 1, "product_name": "Laptop SNSV", "product_description": "Laptop dengan spesifikasi tinggi", "product_price": 10.00, "product_variety": "Gaming", "product_rating": 4.5, "product_stock": 10, "created_at": "2024-09-08T12:34:56Z", "updated_at": "2024-09-08T12:34:56Z" } ]   |
| Not Found (404 Not Found)  | {"message": "No Product"} | 
| Error (500 Internal Server Error)   | { "error": "Database error: [error message]" } |

* **GET /products/:id** : Get a product by ID.

| Method        | GET           | 
|---------------------|----------------------|
| URL       | /products/:id             |
| Path Parameters    | id (integer) [The ID of the product]       | 
|Request Body Type | -            |
| Request Body    | -  |
| Response (200 OK)   | { "id": 1, "name": "Product Name", "description": "Product Description", "price": 99.99, "variety": "Size, Color", "rating": 4.5, "stock": 100, "created_at": "2024-09-07T12:00:00Z", "updated_at": "2024-09-07T12:00:00Z" }   |
| Not Found (404 Not Found)  | { "error": "Product with ID 1 not found." } | 
| Error (500 Internal Server Error)   | { "error": "Database error: [error message]" } |

* **PUT /products/:id** : Update a product by ID.

| Method        | PUT           | 
|---------------------|----------------------|
| URL       | /products/:id             |
| Path Parameters    | id (integer) [The ID of the product]       | 
|Request Body Type | JSON            |
| Request Body    | { "product_name": "Laptop SNSV Updated", "product_description": "Updated description", "product_price": 12.00, "product_variety": "Gaming", "product_rating": 4.8, "product_stock": 15 }  |
| Response (200 OK)   | { "message": "Product updated successfully" }   |
| Error (400 Bad Request)  | { "errors": [{"type": "field", "msg": "Product stock is required", "path": "product_stock","location": "body"},  {"type": "field","msg": "Stock must be a non-negative integer","path": "product_stock","location": "body"  }]} |
| Not Found (404 Not Found)  | { "error": "Product with ID 1 not found." } | 
| Error (500 Internal Server Error)   | { "error": "Database error: [error message]" } |

* **DELETE /products/:id** : Delete a product by ID.

| Method        | DELETE           | 
|---------------------|----------------------|
| URL       | /products/:id             |
| Path Parameters    | id (integer) [The ID of the product]       | 
|Request Body Type | -           |
| Request Body    | -  |
| Response (200 OK)   | { "message": "Product deleted successfully"}   |
| Error (400 Bad Request)  | { "errors": [{"type": "field", "msg": "Product stock is required", "path": "product_stock","location": "body"},  {"type": "field","msg": "Stock must be a non-negative integer","path": "product_stock","location": "body"  }]} |
| Not Found (404 Not Found)  | { "error": "Product with ID 1 not found." } | 
| Error (500 Internal Server Error)   | { "error": "Database error: [error message]" } |

## Database Schema

The database schema for the `simple_task` database is defined as follows:

### Table: `products`

| Column Name         | Data Type           | Constraints                                    | Description                                |
|---------------------|----------------------|------------------------------------------------|--------------------------------------------|
| `product_id`        | `INT`                | `AUTO_INCREMENT, PRIMARY KEY`                 | Unique identifier for the product          |
| `product_name`      | `VARCHAR(255)`       | `NOT NULL`                                     | Name of the product                        |
| `product_description` | `TEXT`             |                                                | Description of the product                 |
| `product_price`     | `DECIMAL(10, 2)`     | `NOT NULL`                                     | Price of the product                       |
| `product_variety`   | `VARCHAR(255)`       |                                                | Variety of the product                     |
| `product_rating`    | `DECIMAL(2, 1)`      | `CHECK (product_rating >= 0 AND product_rating <= 5)` | Rating of the product (0 to 5)            |
| `product_stock`     | `INT`                | `NOT NULL`                                     | Stock quantity of the product              |
| `created_at`        | `TIMESTAMP`          | `DEFAULT CURRENT_TIMESTAMP`                    | Timestamp when the record was created      |
| `updated_at`        | `TIMESTAMP`          | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp when the record was last updated |

### SQL Schema Creation Script

```sql
CREATE DATABASE IF NOT EXISTS simple_task;

USE simple_task;

CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,        
    product_name VARCHAR(255) NOT NULL,            
    product_description TEXT,                       
    product_price DECIMAL(10, 2) NOT NULL,     
    product_variety VARCHAR(255),                    
    product_rating DECIMAL(2, 1) CHECK (product_rating >= 0 AND product_rating <= 5), 
    product_stock INT NOT NULL,                 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
);
```
