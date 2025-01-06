PORT=$1;

docker rm -f bot 2>/dev/null
docker run \
  --name "bot" \
  --env-file ".env" \
  -p $PORT:3008/tcp \
  -v "$(pwd)/bot_sessions:/app/bot_sessions:rw" \
  --cap-add SYS_ADMIN \
  --restart always \
  builderbot:latest
