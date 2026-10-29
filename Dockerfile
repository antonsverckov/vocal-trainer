# Railway: the site is plain files; Caddy serves them (with HTTP ranges for audio seeking) on Railway's $PORT
FROM caddy:2-alpine
COPY . /srv
CMD caddy file-server --root /srv --listen :${PORT:-8080}
