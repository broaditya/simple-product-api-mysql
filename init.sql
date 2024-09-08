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