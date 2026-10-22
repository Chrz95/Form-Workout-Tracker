docker buildx create --use  --buildkitd-config ./buildkitd.toml
docker buildx build --platform linux/arm64,linux/arm64/v8 --target frontend -t 192.168.1.11:5000/form:latest --push .
docker buildx build --platform linux/arm64,linux/arm64/v8 --target backend  -t 192.168.1.11:5000/form-backend:latest --push .
PAUSE