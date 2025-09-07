# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of @tenderlift/simap-client seriously. If you believe you have found a security vulnerability in our code, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue for security vulnerabilities
- Post about the vulnerability publicly before it has been addressed

### Please DO:
- Email us directly at: security@tenderlift.ch
- Include the word "SECURITY" in the subject line
- Provide detailed steps to reproduce the vulnerability
- Allow us reasonable time to respond and fix the issue before public disclosure

### What to expect:
1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Assessment**: We will assess the vulnerability and provide an estimated timeline for a fix
3. **Resolution**: We will keep you informed about the progress of fixing the vulnerability
4. **Credit**: With your permission, we will acknowledge your contribution in the release notes

## Security Best Practices

When using this library:

1. **Keep dependencies updated**: Regularly update to the latest version of @tenderlift/simap-client
2. **Secure your tokens**: Never commit API tokens or credentials to version control
3. **Use environment variables**: Store sensitive configuration in environment variables
4. **HTTPS only**: Always use HTTPS when connecting to the SIMAP API
5. **Validate inputs**: Validate and sanitize all user inputs before sending to the API

## Dependency Security

We regularly audit our dependencies for known vulnerabilities using:
- `pnpm audit` for production dependencies
- GitHub Dependabot for automated security updates
- Manual review of critical dependency updates

## Disclosure Policy

When we receive a security vulnerability report:
1. We will work to verify and reproduce the issue
2. Prepare a fix and release it as soon as possible
3. Publicly disclose the vulnerability after the fix is available

## Contact

For security concerns, please contact:
- Email: security@tenderlift.ch
- For general issues: https://github.com/tenderlift/simap-client/issues