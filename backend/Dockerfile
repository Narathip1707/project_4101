FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Create uploads directory
RUN mkdir -p uploads

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose port 8081
EXPOSE 8081

# Run the binary
CMD ["./main"]