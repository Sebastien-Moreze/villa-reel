#!/usr/bin/env bash

set -euo pipefail

LOG_FILE="/var/log/villa-reel-deploy.log"
APP_NAME="villa-reel-app"
IMAGE_DEFAULT="ghcr.io/sebastien-moreze/villa-reel:latest"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://localhost:3000/api/health}"
RETRIES="${RETRIES:-5}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-5}"

log() {
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

IMAGE="${1:-$IMAGE_DEFAULT}"

log "==== Starting deployment of image $IMAGE ===="

# Optionnel : charger les variables d'environnement depuis un fichier .env si présent
if [ -f ".env" ]; then
  log "Loading environment variables from .env"
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

# Sauvegarder l'image actuelle pour rollback
PREVIOUS_IMAGE_ID=""
if docker ps -a --format '{{.Names}}' | grep -Eq "^${APP_NAME}$"; then
  PREVIOUS_IMAGE_ID="$(docker inspect --format='{{.Image}}' "${APP_NAME}" || true)"
  log "Current container ${APP_NAME} is running with image ${PREVIOUS_IMAGE_ID}"
fi

log "Pulling latest image: $IMAGE"
docker pull "$IMAGE"

if docker ps -a --format '{{.Names}}' | grep -Eq "^${APP_NAME}$"; then
  log "Stopping existing container ${APP_NAME}"
  docker stop "${APP_NAME}" || true
  log "Removing existing container ${APP_NAME}"
  docker rm "${APP_NAME}" || true
fi

log "Starting new container ${APP_NAME} from image ${IMAGE}"
docker run -d \
  --name "${APP_NAME}" \
  -p 3000:3000 \
  -e NODE_ENV="${NODE_ENV:-production}" \
  -e DATABASE_URL="${DATABASE_URL:-}" \
  -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}" \
  -e NEXTAUTH_URL="${NEXTAUTH_URL:-}" \
  -e STRIPE_SK="${STRIPE_SK:-}" \
  -e NEXT_PUBLIC_STRIPE_PK="${NEXT_PUBLIC_STRIPE_PK:-}" \
  -e STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}" \
  -e RESEND_API_KEY="${RESEND_API_KEY:-}" \
  -e CONTACT_EMAIL="${CONTACT_EMAIL:-}" \
  -e HCAPTCHA_SECRET="${HCAPTCHA_SECRET:-}" \
  -e NEXT_PUBLIC_HCAPTCHA_SITE_KEY="${NEXT_PUBLIC_HCAPTCHA_SITE_KEY:-}" \
  -e NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-}" \
  "$IMAGE"

log "Running health check on ${HEALTHCHECK_URL}"
success=0
for i in $(seq 1 "$RETRIES"); do
  if curl -fsS "$HEALTHCHECK_URL" >/dev/null 2>&1; then
    log "Health check succeeded on attempt ${i}"
    success=1
    break
  else
    log "Health check failed on attempt ${i}/${RETRIES}, retrying in ${SLEEP_BETWEEN}s..."
    sleep "$SLEEP_BETWEEN"
  fi
done

if [ "$success" -ne 1 ]; then
  log "Health check failed after ${RETRIES} attempts. Starting rollback."

  # Stop and remove the faulty container
  if docker ps -a --format '{{.Names}}' | grep -Eq "^${APP_NAME}$"; then
    log "Stopping failing container ${APP_NAME}"
    docker stop "${APP_NAME}" || true
    log "Removing failing container ${APP_NAME}"
    docker rm "${APP_NAME}" || true
  fi

  if [ -n "$PREVIOUS_IMAGE_ID" ]; then
    log "Rolling back to previous image ${PREVIOUS_IMAGE_ID}"
    docker run -d \
      --name "${APP_NAME}" \
      -p 3000:3000 \
      -e NODE_ENV="${NODE_ENV:-production}" \
      -e DATABASE_URL="${DATABASE_URL:-}" \
      -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}" \
      -e NEXTAUTH_URL="${NEXTAUTH_URL:-}" \
      -e STRIPE_SK="${STRIPE_SK:-}" \
      -e NEXT_PUBLIC_STRIPE_PK="${NEXT_PUBLIC_STRIPE_PK:-}" \
      -e STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}" \
      -e RESEND_API_KEY="${RESEND_API_KEY:-}" \
      -e CONTACT_EMAIL="${CONTACT_EMAIL:-}" \
      -e HCAPTCHA_SECRET="${HCAPTCHA_SECRET:-}" \
      -e NEXT_PUBLIC_HCAPTCHA_SITE_KEY="${NEXT_PUBLIC_HCAPTCHA_SITE_KEY:-}" \
      -e NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-}" \
      "$PREVIOUS_IMAGE_ID"
    log "Rollback completed, previous version is running."
  else
    log "No previous image found to rollback to. Manual intervention required."
  fi

  exit 1
fi

log "Deployment completed successfully, application is healthy."
exit 0

