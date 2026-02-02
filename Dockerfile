# Production-ready Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application source
COPY . .

# Create upload directories
RUN mkdir -p uploads uploads/products uploads/homepage uploads/public uploads/services

# Expose port
EXPOSE 3008

# Simple HTTP healthcheck (uses node which exists in image)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "const http=require('http');const req=http.get('http://localhost:3008/',res=>process.exit(res.statusCode>=200&&res.statusCode<500?0:1));req.on('error',()=>process.exit(1));" || exit 1

# Start the app
CMD ["npm", "start"]
