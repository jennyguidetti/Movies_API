# Project Overview
This project involves the development of a Node.js and Express-based API for retrieving and managing movie data stored in a MySQL database. The API is designed to implement RESTful principles and secure data handling practices. It provides functionalities such as searching for movies, retrieving detailed movie information, user authentication, and managing movie posters.

# Features
1. Movie Data Retrieval: Fetch movies by title, year, and other attributes.
2. Detailed Movie Information: Retrieve comprehensive details using IMDb IDs.
3. User Authentication: Secure user registration and login with hashed passwords and JWTs.
4. Poster Management: Upload and retrieve movie posters with file handling support.
5. Secure API: Implements HTTPS, JWT-based authentication, and environment-variable-based configurations for sensitive data.

# Installation and User Guide
Included in report.pdf

# Testing and Limitations
- All endpoints are thoroughly tested using Insomnia.
- Common edge cases and error conditions (e.g., invalid parameters, authentication failures) are handled robustly.
- Reliance on the external OMDB API for additional data introduces some dependency risks.

# Security Features
- HTTPS with TLS: Self-signed certificate used for development.
- Environment Variables: Secure storage for sensitive information.
- Helmet Module: Protects against common vulnerabilities.
- JWT Authentication: Secure access to protected endpoints.
- Bcrypt: Passwords are hashed and salted before storage.