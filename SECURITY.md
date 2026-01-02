# Security Policy

## Overview

GroundScanner takes security seriously. This document outlines our security practices and provides guidance for developers and users.

## 🔒 Security Best Practices

### For Developers

1. **Never Commit Secrets**
   - ⚠️ Do not commit `.env`, `.env.local`, or any files containing secrets
   - ✅ All sensitive files are already in `.gitignore`
   - ✅ Use environment variables for all sensitive configuration

2. **Environment Variables**
   - Store API keys in `.env` files (backend) or `.env.local` (frontend)
   - Never hardcode credentials in source code
   - Use strong, unique values for production secrets

3. **API Keys & Tokens**
   - `MONGODB_CONNECTION_STRING` - Database connection (keep secret)
   - `SECRET_KEY` / `JWT_SECRET_KEY` - Authentication signing key (keep secret)
   - `CLIMATIQ_API_KEY` - Emissions API (keep secret)
   - `TAVILY_API_KEY` - Search API (keep secret)

4. **Authentication**
   - Passwords are hashed using Argon2 (industry standard)
   - JWTs are used for authentication tokens
   - Refresh tokens are stored securely in HTTP-only cookies
   - All tokens have expiration times

### For Users

1. **Setup Instructions**
   - Copy the example `.env` configuration from README files
   - Replace all placeholder values with your actual credentials
   - Never share your `.env` files publicly

2. **Production Deployment**
   - Use strong, randomly generated secrets
   - Enable HTTPS for all production deployments
   - Regularly rotate API keys and secrets
   - Restrict CORS origins to your actual domains

## 🛡️ Security Features

### Backend Security

- ✅ **Password Hashing**: Argon2 algorithm for secure password storage
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **CORS Protection**: Configured allowed origins
- ✅ **Environment Variables**: No hardcoded secrets
- ✅ **Input Validation**: FastAPI request validation
- ✅ **Token Expiration**: Access and refresh tokens expire

### Frontend Security

- ✅ **Environment Variables**: VITE_ prefix for safe client-side config
- ✅ **API Authentication**: Bearer token in headers
- ✅ **Secure Storage**: Tokens in localStorage with proper handling
- ✅ **XSS Protection**: React's built-in escaping

## 🔍 What This Repository Contains

### Safe to Share (Public Repository Ready)

- ✅ Source code with no hardcoded credentials
- ✅ Configuration examples (not actual secrets)
- ✅ Documentation and README files
- ✅ Test files with mock data only
- ✅ `.gitignore` properly configured

### Not Included (Private)

- ❌ No `.env` or `.env.local` files
- ❌ No API keys or access tokens
- ❌ No database credentials
- ❌ No production secrets
- ❌ No personal information

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Replace all example credentials with real ones
- [ ] Use strong, randomly generated secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains only
- [ ] Set appropriate token expiration times
- [ ] Enable rate limiting on API endpoints
- [ ] Review and update allowed origins
- [ ] Test authentication flows
- [ ] Verify environment variables are set
- [ ] Enable logging and monitoring

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **Do Not** open a public GitHub issue
2. Contact the repository maintainer privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Environment Variables Best Practices](https://12factor.net/config)

## ✅ Verification

This repository has been audited for:
- ✅ Hardcoded credentials
- ✅ Committed environment files
- ✅ Exposed API keys
- ✅ Database connection strings
- ✅ Personal information
- ✅ Git history for secrets

**Last Security Audit**: January 2026

---

**Remember**: Security is a shared responsibility. Always follow best practices and keep your credentials safe!
