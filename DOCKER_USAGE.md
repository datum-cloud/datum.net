# Using Docker with Datum.net

This guide provides instructions for running and managing the Datum.net website using Docker in different environments.

## Development Environment

To start the development environment:

```bash
# Start development server
docker compose up dev

# Access the site at
http://localhost:4321
```

The development environment includes:

- Hot reloading
- Source code mounting
- Development dependencies
- Debugging capabilities

## Preview Environment (Static)

To run the static site preview:

```bash
# Start preview server
docker compose up preview

# Access the site at
http://localhost:4321
```

The preview environment:

- Uses static site generation
- Serves pre-built assets
- Simulates production environment
- Includes production dependencies only

## Production Environment (SSR)

To run the production SSR server:

```bash
# Start production server
docker compose up prod

# Access the site at
http://localhost:4321
```

The production environment:

- Uses server-side rendering
- Handles dynamic content
- Includes API routes
- Optimized for production

## Common Operations

### Starting Services

```bash
# Start all services
docker compose up

# Start specific service
docker compose up dev
docker compose up preview
docker compose up prod

# Start in detached mode
docker compose up -d
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop specific service
docker compose stop dev
docker compose stop preview
docker compose stop prod
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs dev
docker compose logs preview
docker compose logs prod

# Follow logs in real-time
docker compose logs -f
```

### Managing Containers

```bash
# List running containers
docker compose ps

# Restart containers
docker compose restart

# Rebuild and restart
docker compose up --build
```

### Environment Management

```bash
# Check environment variables
docker compose config

# Update environment variables
# Edit .env file and restart
docker compose down
docker compose up
```

## Switching Between Modes

### From Development to Preview

```bash
# Stop development
docker compose down

# Start preview
docker compose up preview
```

### From Preview to Production

```bash
# Stop preview
docker compose down

# Start production
docker compose up prod
```

### From Production to Development

```bash
# Stop production
docker compose down

# Start development
docker compose up dev
```

## Monitoring and Maintenance

### Check Container Status

```bash
# View container status
docker compose ps

# View resource usage
docker stats
```

### Cleanup

```bash
# Remove all containers and networks
docker compose down

# Remove all images
docker compose down --rmi all

# Remove volumes
docker compose down -v
```

### Backup and Restore

```bash
# Backup volumes
docker run --rm -v datum-network:/volume -v /backup:/backup alpine tar -czf /backup/backup.tar.gz -C /volume ./

# Restore volumes
docker run --rm -v datum-network:/volume -v /backup:/backup alpine sh -c "rm -rf /volume/* /volume/..?* /volume/.[!.]* ; tar -C /volume/ -xzf /backup/backup.tar.gz"
```

## Troubleshooting

### Common Issues

1. Port conflicts:

   ```bash
   # Check port usage
   lsof -i :4321
   lsof -i :80

   # Change ports in docker-compose.yml if needed
   ```

2. Container won't start:

   ```bash
   # Check logs
   docker compose logs

   # Check container status
   docker compose ps

   # Try rebuilding
   docker compose up --build
   ```

3. Network issues:

   ```bash
   # Check network
   docker network inspect datum-network

   # Restart network
   docker network rm datum-network
   docker compose up
   ```

### Performance Issues

1. High CPU usage:

   ```bash
   # Check resource usage
   docker stats

   # Adjust resource limits in docker-compose.yml
   ```

2. Memory issues:

   ```bash
   # Check memory usage
   docker stats

   # Adjust memory limits
   docker update --memory 2G --memory-swap -1 container_name
   ```

3. Slow response times:

   ```bash
   # Check container logs
   docker compose logs

   # Consider scaling
   docker compose up --scale prod=3
   ```

## Best Practices

1. Always use `.env` for sensitive information
2. Keep containers updated with security patches
3. Monitor resource usage regularly
4. Use volume backups for important data
5. Implement proper logging and monitoring
6. Follow the principle of least privilege
7. Keep development and production environments separate
8. Use specific versions for images and dependencies
9. Implement proper health checks
10. Follow Docker security best practices
