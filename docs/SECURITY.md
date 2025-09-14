# Security

## Built-in Security Features

✅ **Session-based authentication** with RBAC  
✅ **CSRF protection** for state-changing operations  
✅ **Rate limiting** on auth endpoints  
✅ **Input validation** with Zod schemas  
✅ **Secure headers** automatically applied  
✅ **Environment validation** with type safety  

## Production Checklist

- [ ] Use strong `SESSION_SECRET` (64+ chars)
- [ ] Enable HTTPS
- [ ] Run `npm audit` for vulnerabilities
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins

## Security Headers
```
Content-Security-Policy: default-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

## Report Issues
Report on GitHub
