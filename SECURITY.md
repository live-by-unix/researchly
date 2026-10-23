# Security Policy

## Supported Versions

Current version: 1.0.0

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. Email security details to: security-researchly@live-by-unix.com (placeholder - update with actual contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

We will:
- Acknowledge receipt within 48 hours
- Provide a timeline for fix
- Coordinate disclosure if needed

## Security Best Practices

### For Users

- Keep API keys secret
- Never commit `.dev.vars` or `.env` files
- Use production secrets, not local variables
- Monitor Cloudflare usage for anomalies
- Keep dependencies updated

### For Developers

- Never hardcode API keys
- Use environment variables for secrets
- Validate all user input
- Sanitize rendered content
- Follow OWASP guidelines
- Keep dependencies updated
- Use HTTPS in production

### Known Security Considerations

1. **Web Content as Untrusted Data**
   - Source pages may contain malicious instructions
   - AI prompts are designed to ignore instructions in source content
   - Do not execute or follow instructions from source content

2. **API Key Storage**
   - API keys stored in Cloudflare Worker secrets
   - Never exposed to frontend
   - Rotate keys if compromised

3. **CORS Configuration**
   - Currently allows all origins (`*`)
   - Consider restricting in production if needed

4. **Rate Limiting**
   - No explicit rate limiting implemented
   - Relies on Cloudflare's DDoS protection
   - Consider adding application-level rate limiting

## Dependency Security

Run security audits:

```bash
npm audit
npm audit fix
```

Update dependencies regularly:

```bash
npm update
```

## Secrets Management

### Development

- Use `worker/.dev.vars` (gitignored)
- Never commit secrets to Git
- Reference `.dev.vars.example` for format

### Production

- Use Wrangler secrets: `wrangler secret put KEY_NAME`
- Never store secrets in code
- Rotate keys regularly

### Key Rotation

1. Generate new API key from provider
2. Update local `.dev.vars`
3. Update production secret
4. Redeploy Worker
5. Verify functionality
6. Revoke old key

## Vulnerability Response

For confirmed vulnerabilities:

1. Patch within 7 days for critical
2. Patch within 14 days for high
3. Patch within 30 days for medium/low
4. Release security advisory
5. Coordinate disclosure timeline

## Security-Related Features

- Input validation on all API endpoints
- Request size limits
- Timeout configuration
- Safe rendering of source content
- No credential exposure in frontend
- CORS support
- Error messages without internal details

## Security Audits

- Automated dependency scanning via npm audit
- Manual code review before major releases
- Consider third-party security audit for production

## Questions

For security questions not related to vulnerabilities, open a discussion or issue with the "security" label.
