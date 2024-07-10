CREATE DATABASE  IF NOT EXISTS `conexao` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `conexao`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: conexao
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admgeral`
--

DROP TABLE IF EXISTS `admgeral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admgeral` (
  `nome` varchar(100) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admgeral`
--

LOCK TABLES `admgeral` WRITE;
/*!40000 ALTER TABLE `admgeral` DISABLE KEYS */;
INSERT INTO `admgeral` VALUES ('Adriana',1,'emailadm@gmail.com');
/*!40000 ALTER TABLE `admgeral` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historicossalvos`
--

DROP TABLE IF EXISTS `historicossalvos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicossalvos` (
  `historico` text,
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int DEFAULT NULL,
  `id_profissional` int DEFAULT NULL,
  `precoConsulta` double DEFAULT NULL,
  `inicioConsulta` timestamp NULL DEFAULT NULL,
  `finalConsulta` timestamp NULL DEFAULT NULL,
  `data` date DEFAULT NULL,
  `finalReal` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `precoReal` double DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicossalvos`
--

LOCK TABLES `historicossalvos` WRITE;
/*!40000 ALTER TABLE `historicossalvos` DISABLE KEYS */;
INSERT INTO `historicossalvos` VALUES ('||n|||U|oiii||n|||P|oláaa!',22,4,21,10,'2024-07-02 14:30:43','2024-07-02 14:35:43','2024-07-02','2024-07-02 14:31:46',4),('||n|||U|Oláaa||n|||P|sdfgsdgsd||n|||P|sdgsdggdgdgdg',23,4,21,10,'2024-07-02 14:42:06','2024-07-02 14:47:06','2024-07-02','2024-07-02 14:42:37',2),('||n|||U|ooi',24,4,21,10,'2024-07-02 15:16:08','2024-07-02 15:21:08','2024-07-02','2024-07-02 15:17:31',4),('||n|||U|oooi||n|||U|olaaaa||n|||U|oi||n|||P|ooolaaaa',25,4,21,10,'2024-07-02 16:36:31','2024-07-02 16:41:31','2024-07-02','2024-07-02 16:37:18',2),('||n|||P|olá, tudo bem? Como posso te ajudar?||n|||U|olá',26,4,21,20,'2024-07-02 22:30:12','2024-07-02 22:40:12','2024-07-02','2024-07-02 22:36:31',14),('||n|||P|oiiiaasssss',27,4,21,10,'2024-07-02 23:35:59','2024-07-02 23:40:59','2024-07-02','2024-07-02 23:37:30',4),('||n|||U|OOOOOLAAAA',28,4,21,10,'2024-07-02 23:54:20','2024-07-02 23:59:20','2024-07-02','2024-07-02 23:54:31',2),('||n|||U|oi',29,4,21,10,'2024-07-03 04:18:45','2024-07-03 04:23:45','2024-07-03','2024-07-03 04:21:23',6),('||n|||U|AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA||n|||P|BBBBBBBBBBBBBBBB',33,4,21,10,'2024-07-03 16:41:16','2024-07-03 16:46:16','2024-07-03','2024-07-03 16:43:13',4),('||n|||U|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa||n|||P|bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb||n||[img]http://localhost:8080/images/1718987404760_4-ouros.jpg[img]http://localhost:8080/images/1718987404760_3-ouros.jpg[img]http://localhost:8080/images/1718987404760_2-ouros.jpg',34,4,21,20,'2024-07-03 16:44:49','2024-07-03 16:54:49','2024-07-03','2024-07-03 16:52:35',16),('||n|||U|AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA||n|||P|bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',35,4,21,20,'2024-07-03 16:53:27','2024-07-03 17:03:27','2024-07-03','2024-07-03 16:58:46',12),('||n|||U|O, lembra da minha ultima consulta?||n|||P|lembro sim',36,4,21,10,'2024-07-03 16:59:44','2024-07-03 17:04:44','2024-07-03','2024-07-03 17:02:47',8),('||n|||U|oi\naqui quero testar a quebra',37,4,21,10,'2024-07-04 05:54:39','2024-07-04 05:59:39','2024-07-04','2024-07-04 05:55:02',2),('||n|||U|oiii||n|||U|oidsfmkasfasdfs||n|||P|olá||n|||U|oiiiii',38,4,21,10,'2024-07-04 16:58:32','2024-07-04 17:03:32','2024-07-04','2024-07-04 16:59:41',4),('||n|||U|oi||n|||U|ssss',39,4,21,10,'2024-07-05 01:29:43','2024-07-05 01:34:43','2024-07-04','2024-07-05 01:30:21',2),('||n|||U|oiii||n|||P|ol´paaa',40,4,21,10,'2024-07-05 03:20:57','2024-07-05 03:25:57','2024-07-05','2024-07-05 03:21:29',2),('||n|||U|OOOi||n|||P|olá!',41,4,21,10,'2024-07-05 04:44:30','2024-07-05 04:49:30','2024-07-05','2024-07-05 04:45:19',2),('||n|||P|oi tudo bem?||n|||U|oiii',42,6,21,10,'2024-07-07 17:53:37','2024-07-07 17:58:37','2024-07-07','2024-07-07 17:54:20',2),('||n|||P|oiiii||n|||U|ola',43,6,21,10,'2024-07-07 17:55:17','2024-07-07 18:00:17','2024-07-07','2024-07-07 17:55:46',2),('||n|||P|oiii||n|||U|ola',44,6,21,10,'2024-07-08 02:07:12','2024-07-08 02:12:12','2024-07-07','2024-07-08 02:07:46',2);
/*!40000 ALTER TABLE `historicossalvos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagensblog`
--

DROP TABLE IF EXISTS `imagensblog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagensblog` (
  `path_img_blog` varchar(500) DEFAULT NULL,
  `id_img_blog` int NOT NULL AUTO_INCREMENT,
  `id_post` int DEFAULT NULL,
  PRIMARY KEY (`id_img_blog`),
  KEY `fk_idPost` (`id_post`),
  CONSTRAINT `fk_idPost` FOREIGN KEY (`id_post`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagensblog`
--

LOCK TABLES `imagensblog` WRITE;
/*!40000 ALTER TABLE `imagensblog` DISABLE KEYS */;
INSERT INTO `imagensblog` VALUES ('1718051989946_logoConexao.png',1,3);
/*!40000 ALTER TABLE `imagensblog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loginadmgeral`
--

DROP TABLE IF EXISTS `loginadmgeral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loginadmgeral` (
  `email` varchar(100) DEFAULT NULL,
  `hash` varchar(100) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `id_admGeral` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_idadmgeral` (`id_admGeral`),
  CONSTRAINT `fk_idadmgeral` FOREIGN KEY (`id_admGeral`) REFERENCES `admgeral` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loginadmgeral`
--

LOCK TABLES `loginadmgeral` WRITE;
/*!40000 ALTER TABLE `loginadmgeral` DISABLE KEYS */;
INSERT INTO `loginadmgeral` VALUES ('emailadm@gmail.com','$2a$10$ZxbF42OSDScmYl9h2jtFt.6xSffgvo6iJvPDWrj8HcADqmlPsDx1i',1,1);
/*!40000 ALTER TABLE `loginadmgeral` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loginatendentes`
--

DROP TABLE IF EXISTS `loginatendentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loginatendentes` (
  `email` varchar(100) DEFAULT NULL,
  `hash` varchar(100) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_idprofissional` (`id_profissional`),
  CONSTRAINT `fk_idprofissional` FOREIGN KEY (`id_profissional`) REFERENCES `profissionais` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loginatendentes`
--

LOCK TABLES `loginatendentes` WRITE;
/*!40000 ALTER TABLE `loginatendentes` DISABLE KEYS */;
INSERT INTO `loginatendentes` VALUES ('pro1@gmail.com','$2a$10$U2oH7375ktfQr/W5Q6SZsO3QcYU7rjtRI6BP7/ztGWqZffWJps8ym',2,16),('pro2@gmail.com','$2a$10$1yQ5t5twna/pNORMUGMW1eSMWJnKDwHNyxEEld6/HZp.s3POZM6PS',3,17),('pro3@gmail.com','$2a$10$/mDYICJq3TfRLopUix04D.E4hU5A1Q7y.yk8r5imtRPCnhuCNfzga',4,18),('pro4@gmail.com','$2a$10$LdU1NC44N8clnKU7y26Hdu1NGJZAf7vaRU85ZIGU36tliGUY0ZpD.',5,19),('pro5@gmail.com','$2a$10$d2nQI.DYrISpH5bYjSr0M.Qm/4DzKzSDbQjgC.mkLqsM9olHAzFym',6,20),('pro6@gmail.com','$2a$10$obOE1CT0nCG5nvFvK1dyuuAZq79M4lHFHuUo1GFGoqv6CXecfyRR.',7,21);
/*!40000 ALTER TABLE `loginatendentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loginusuario`
--

DROP TABLE IF EXISTS `loginusuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loginusuario` (
  `email` varchar(100) DEFAULT NULL,
  `hash` varchar(100) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_idusuario` (`id_usuario`),
  CONSTRAINT `fk_idusuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loginusuario`
--

LOCK TABLES `loginusuario` WRITE;
/*!40000 ALTER TABLE `loginusuario` DISABLE KEYS */;
INSERT INTO `loginusuario` VALUES ('usuario4@gmail.com','$2a$10$.SQ29rm3CHvhmmwZN7/d9ezhNV9NR3dAGgZWdxf0jGZcWf1ZXxdxe',1,4),('usuario5@gmail.com','$2a$10$mK1Nf6NmwVyOmkrKuw4PL.0lZ5uvVpA0utgJUrq6fWFq8cO3RMQTi',2,5),('usuario6@gmail.com','$2a$10$ZjT/LPL7qtF.5BXWqcm.S.Y1bwU3rWkqwkYqOCv66oLSKQrG9DNQK',3,6);
/*!40000 ALTER TABLE `loginusuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id_pagamento` varchar(70) NOT NULL,
  `valor` int DEFAULT NULL,
  `idempotencyKey` varchar(70) DEFAULT NULL,
  `nomeUsuario` varchar(100) DEFAULT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `data` timestamp NULL DEFAULT NULL,
  `status` varchar(70) DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_pagamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
INSERT INTO `pagamentos` VALUES ('81713367771',1,'b5c13739-8ba2-424e-bc30-96c80111294e','usuario 4','17162148743','2024-07-04 03:06:42','pago',4),('81715066483',1,'e9f634e8-6b28-47e1-b2a8-2b68aee40660','usuario 4','17162148743','2024-07-04 03:59:43','pago',4),('81975420712',3,'24ddfb87-672e-4bfc-b116-e1d351eafd11','usuario 4','17162148743','2024-07-04 00:42:53','pago',4);
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `titulo` varchar(200) DEFAULT NULL,
  `texto` varchar(5000) DEFAULT NULL,
  `data_postagem` datetime DEFAULT CURRENT_TIMESTAMP,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('ggdfsgdfs','gdfsdgfddfgs','2024-06-10 17:26:30',1),('ggdfsgdfssss','gdfsdgfddfgs','2024-06-10 17:38:50',2),('Titulo namoral 1','desc namoral 1','2024-06-10 17:39:50',3);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profissionais`
--

DROP TABLE IF EXISTS `profissionais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profissionais` (
  `foto` varchar(100) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'offline',
  `descricaoMenor` varchar(200) DEFAULT '',
  `descricaoMaior` varchar(2000) DEFAULT '',
  `valorMin` double DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profissionais`
--

LOCK TABLES `profissionais` WRITE;
/*!40000 ALTER TABLE `profissionais` DISABLE KEYS */;
INSERT INTO `profissionais` VALUES ('1718987747068_screen3.png','profissional 1',16,'pro1@gmail.com','offline','','',1),('1719235228094_logoConexao.png','Profissional 2',17,'pro2@gmail.com','offline','','',1),('1719235385707_2-ouros.jpg','Profissional 3',18,'pro3@gmail.com','offline','','',1),('1719359818073_4-paus.jpg','Profissional 4',19,'pro4@gmail.com','offline','Descrição profissional 4 para aparecer na página principal','Por mais que ela não vai ser gigante, o importante é perceber que veio essa mensagem específica para cá e não a outra menor que aparece na página principal. Esse texto é maior\n\nEsse texto é maiorEsse texto é maiorEsse texto é maiorEsse texto é maior, Esse texto é maiorEsse texto é maior\n\nEsse texto é maior',1),('1719406526921_3-paus.jpg','profissional 5',20,'pro5@gmail.com','offline','profissional 5 e suas qualidades','Qualidades mais bem explicadas do pro 5',1),('1719406618304_3-ouros.jpg','profissional 6',21,'pro6@gmail.com','online','profissional 6 e suas qualidades','Qualidades mais bem explicadas do pro 6',2);
/*!40000 ALTER TABLE `profissionais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reltrabprof`
--

DROP TABLE IF EXISTS `reltrabprof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reltrabprof` (
  `id_trabalho` int DEFAULT NULL,
  `id_profissional` int DEFAULT NULL,
  KEY `fk_idTrab` (`id_trabalho`),
  KEY `fk_idProf` (`id_profissional`),
  CONSTRAINT `fk_idProf` FOREIGN KEY (`id_profissional`) REFERENCES `profissionais` (`id`),
  CONSTRAINT `fk_idTrab` FOREIGN KEY (`id_trabalho`) REFERENCES `trabalhos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reltrabprof`
--

LOCK TABLES `reltrabprof` WRITE;
/*!40000 ALTER TABLE `reltrabprof` DISABLE KEYS */;
INSERT INTO `reltrabprof` VALUES (9,16),(10,16),(10,17),(9,18);
/*!40000 ALTER TABLE `reltrabprof` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salas` (
  `idSala` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int DEFAULT NULL,
  `id_profissional` int DEFAULT NULL,
  `aberta` tinyint(1) DEFAULT '1',
  `historico` text,
  `tempoConsulta` int DEFAULT '0',
  `precoConsulta` double DEFAULT '0',
  `inicioConsulta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `finalConsulta` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idSala`)
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas`
--

LOCK TABLES `salas` WRITE;
/*!40000 ALTER TABLE `salas` DISABLE KEYS */;
/*!40000 ALTER TABLE `salas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trabalhos`
--

DROP TABLE IF EXISTS `trabalhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabalhos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trabalho` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trabalhos`
--

LOCK TABLES `trabalhos` WRITE;
/*!40000 ALTER TABLE `trabalhos` DISABLE KEYS */;
INSERT INTO `trabalhos` VALUES (9,'Baralho Ouros'),(10,'Baralho Paus');
/*!40000 ALTER TABLE `trabalhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `urlstrabalhos`
--

DROP TABLE IF EXISTS `urlstrabalhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `urlstrabalhos` (
  `url` varchar(500) DEFAULT NULL,
  `id_trabalho` int DEFAULT NULL,
  KEY `fk_idTrabalho` (`id_trabalho`),
  CONSTRAINT `fk_idTrabalho` FOREIGN KEY (`id_trabalho`) REFERENCES `trabalhos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `urlstrabalhos`
--

LOCK TABLES `urlstrabalhos` WRITE;
/*!40000 ALTER TABLE `urlstrabalhos` DISABLE KEYS */;
INSERT INTO `urlstrabalhos` VALUES ('1718987404760_4-ouros.jpg',9),('1718987404760_3-ouros.jpg',9),('1718987404760_2-ouros.jpg',9),('1718987404761_9-ouros.jpg',9),('1718987404761_8-ouros.jpg',9),('1718987404761_7-ouros.jpg',9),('1718987446140_3-paus.jpg',10),('1718987446140_2-paus.jpg',10),('1718987446140_4-paus.jpg',10),('1718987446140_5-paus.jpg',10),('1718987446141_6-paus.jpg',10),('1718987446141_7-paus.jpg',10);
/*!40000 ALTER TABLE `urlstrabalhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `saldo` int DEFAULT '0',
  `previsaoSaldo` double DEFAULT '0',
  `dataNas` varchar(15) DEFAULT '00/00/0000',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'usuario 1','usuario1@gmail.com',20,20,'00/00/0000'),(2,'usuario 2','usuario2@gmail.com',11,11,'00/00/0000'),(3,'usuario 3','usuario3@gmail.com',11,11,'00/00/0000'),(4,'usuario 4','usuario4@gmail.com',40,30,'00/00/0000'),(5,'usuario 5','usuario5@gmail.com',11,11,'00/00/0000'),(6,'usuario 6','usuario6@gmail.com',24,24,'01/01/1999');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-10  3:11:21
