-- Script para inserir usuário de teste no banco de dados
-- Execute no MySQL/MariaDB

-- 1. Verificar usuários existentes
SELECT user_id, email, password FROM users;

-- 2. Se a tabela users não existir, criá-la (ajuste conforme sua schema)
-- CREATE TABLE IF NOT EXISTS users (
--   user_id CHAR(36) PRIMARY KEY,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL,
--   username VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 3. Inserir novo usuário (substitua com suas credenciais)
-- Senha: 123456
-- Hash BCrypt: $2a$10$NaGfZwzFEGMJa7fhcpEhCO5hGBchLMz1LCKVsUHrKZC4pZKRxLbBC
INSERT INTO users (user_id, email, password, username, created_at) 
VALUES (
  UUID(), 
  'luizzzz@gmail.com', 
  '$2a$10$NaGfZwzFEGMJa7fhcpEhCO5hGBchLMz1LCKVsUHrKZC4pZKRxLbBC',
  'Luiz',
  NOW()
);

-- 4. Verificar se foi inserido
SELECT user_id, email, username FROM users WHERE email = 'luizzzz@gmail.com';

-- 5. LIMPAR USUÁRIOS DUPLICADOS (se houver)
-- DELETE FROM users WHERE email = 'luizzzz@gmail.com' AND user_id != (
--   SELECT user_id FROM users WHERE email = 'luizzzz@gmail.com' LIMIT 1
-- );
