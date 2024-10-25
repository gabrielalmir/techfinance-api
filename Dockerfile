# Use Bun.js base image
FROM oven/bun:latest as builder

WORKDIR /usr/src/app

# Copy the rest of the application files
COPY . .

# Install dependencies
RUN bun install

# Build the application (compile to native ./main)
RUN bun run compile

# Use a minimal image for production
FROM debian:bookworm

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist /usr/local/bin/

# Set the command to run your app
CMD ["main"]
